import * as React from "react"
import {
  PanResponder,
  Platform,
  type LayoutChangeEvent,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"

type ResizableDirection = "horizontal" | "vertical"

type PanelConstraints = {
  minSize?: number
  maxSize?: number
}

type ResizableContextValue = {
  direction: ResizableDirection
  sizes: number[]
  panelCount: number
  containerSize: number
  setContainerSize: (size: number) => void
  registerPanel: (index: number, constraints: PanelConstraints) => () => void
  resizeByDelta: (index: number, deltaPx: number) => void
  resizeByPercent: (index: number, deltaPercent: number) => void
}

const ResizableContext = React.createContext<ResizableContextValue | null>(null)

function useResizable() {
  const context = React.useContext(ResizableContext)
  if (!context) {
    throw new Error(
      "Resizable components must be used within ResizablePanelGroup",
    )
  }
  return context
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function normalizeSizes(sizes: number[], count: number) {
  if (count <= 0) return []
  const safeSizes = sizes.map((value) => (Number.isFinite(value) ? Math.max(0, value) : 0))
  const total = safeSizes.reduce((sum, value) => sum + value, 0)
  if (total <= 0) {
    return Array.from({ length: count }, () => 100 / count)
  }
  return safeSizes.map((value) => (value / total) * 100)
}

export type ResizablePanelProps = ViewProps & {
  defaultSize?: number
  minSize?: number
  maxSize?: number
  collapsible?: boolean
  collapsedSize?: number
  _index?: number
}

export type ResizableHandleProps = ViewProps & {
  disabled?: boolean
  withHandle?: boolean
  keyboardStep?: number
  _index?: number
}

export type ResizablePanelGroupProps = ViewProps & {
  direction?: ResizableDirection
  sizes?: number[]
  defaultSizes?: number[]
  onSizesChange?: (sizes: number[]) => void
}

/**
 * Resizable panel group (web-first).
 *
 * **Limitations:**
 * - Panels use percentage sizing; keep counts modest.
 * - Native support is basic (drag handles); no keyboard resizing.
 */
export const ResizablePanelGroup = React.forwardRef<
  View,
  ResizablePanelGroupProps
>(
  (
    {
      direction = "horizontal",
      sizes: sizesProp,
      defaultSizes,
      onSizesChange,
      style,
      children,
      onLayout,
      ...props
    },
    ref,
  ) => {
    const [containerSize, setContainerSize] = React.useState(0)

    const { enhancedChildren, panelDefaults } = React.useMemo(() => {
      const isResizablePanelElement = (
        child: React.ReactNode,
      ): child is React.ReactElement<ResizablePanelProps> =>
        React.isValidElement(child) && child.type === ResizablePanel
      const isResizableHandleElement = (
        child: React.ReactNode,
      ): child is React.ReactElement<ResizableHandleProps> =>
        React.isValidElement(child) && child.type === ResizableHandle
      let panelIndex = -1
      const defaults: Array<number | undefined> = []
      const mapped = React.Children.map(children, (child) => {
        if (isResizablePanelElement(child)) {
          panelIndex += 1
          const defaultSize =
            typeof child.props.defaultSize === "number"
              ? child.props.defaultSize
              : undefined
          defaults.push(defaultSize)
          return React.cloneElement(child, { _index: panelIndex })
        }
        if (isResizableHandleElement(child)) {
          return React.cloneElement(child, { _index: panelIndex })
        }
        return child
      })
      return { enhancedChildren: mapped, panelDefaults: defaults }
    }, [children])

    const panelCount = panelDefaults.length
    const hasPanelDefaults = panelDefaults.some(
      (value) => typeof value === "number",
    )

    const initialSizes = React.useMemo(() => {
      if (panelCount === 0) return []
      if (defaultSizes && defaultSizes.length === panelCount) {
        return normalizeSizes(defaultSizes, panelCount)
      }
      if (hasPanelDefaults) {
        const normalizedDefaults = panelDefaults.map((value) =>
          typeof value === "number" ? value : 0,
        )
        return normalizeSizes(normalizedDefaults, panelCount)
      }
      return normalizeSizes(Array.from({ length: panelCount }, () => 1), panelCount)
    }, [defaultSizes, hasPanelDefaults, panelCount, panelDefaults])

    const [uncontrolledSizes, setUncontrolledSizes] = React.useState(() => initialSizes)

    const isControlled = sizesProp !== undefined
    const resolvedSizes = React.useMemo(() => {
      if (panelCount === 0) return []
      if (isControlled && sizesProp && sizesProp.length === panelCount) {
        return normalizeSizes(sizesProp, panelCount)
      }
      if (!isControlled && uncontrolledSizes.length === panelCount) {
        return normalizeSizes(uncontrolledSizes, panelCount)
      }
      return initialSizes
    }, [initialSizes, isControlled, panelCount, sizesProp, uncontrolledSizes])

    React.useEffect(() => {
      if (isControlled) return
      if (panelCount === 0) {
        setUncontrolledSizes([])
        return
      }
      if (uncontrolledSizes.length !== panelCount) {
        setUncontrolledSizes(initialSizes)
      }
    }, [initialSizes, isControlled, panelCount, uncontrolledSizes.length])

    const setSizesState = React.useCallback(
      (nextSizes: number[]) => {
        const normalized = normalizeSizes(nextSizes, panelCount)
        if (!isControlled) {
          setUncontrolledSizes(normalized)
        }
        onSizesChange?.(normalized)
      },
      [isControlled, onSizesChange, panelCount],
    )

    const constraintsRef = React.useRef(new Map<number, PanelConstraints>())

    const registerPanel = React.useCallback(
      (index: number, constraints: PanelConstraints) => {
        constraintsRef.current.set(index, constraints)
        return () => {
          constraintsRef.current.delete(index)
        }
      },
      [],
    )

    const resizeByPercent = React.useCallback(
      (index: number, deltaPercent: number) => {
        if (panelCount < 2) return
        if (index < 0 || index >= panelCount - 1) return

        const nextSizes = [...resolvedSizes]
        const currentLeft = nextSizes[index] ?? 0
        const currentRight = nextSizes[index + 1] ?? 0

        const leftConstraints = constraintsRef.current.get(index) ?? {}
        const rightConstraints = constraintsRef.current.get(index + 1) ?? {}

        const leftMin = leftConstraints.minSize ?? 0
        const leftMax = leftConstraints.maxSize ?? 100
        const rightMin = rightConstraints.minSize ?? 0
        const rightMax = rightConstraints.maxSize ?? 100

        const minDelta = Math.max(leftMin - currentLeft, currentRight - rightMax)
        const maxDelta = Math.min(leftMax - currentLeft, currentRight - rightMin)

        const clampedDelta = clamp(deltaPercent, minDelta, maxDelta)
        nextSizes[index] = currentLeft + clampedDelta
        nextSizes[index + 1] = currentRight - clampedDelta

        setSizesState(nextSizes)
      },
      [panelCount, resolvedSizes, setSizesState],
    )

    const resizeByDelta = React.useCallback(
      (index: number, deltaPx: number) => {
        if (containerSize <= 0) return
        const deltaPercent = (deltaPx / containerSize) * 100
        resizeByPercent(index, deltaPercent)
      },
      [containerSize, resizeByPercent],
    )

    const handleLayout = React.useCallback(
      (event: LayoutChangeEvent) => {
        const size =
          direction === "horizontal"
            ? event.nativeEvent.layout.width
            : event.nativeEvent.layout.height
        setContainerSize(size)
        onLayout?.(event)
      },
      [direction, onLayout],
    )

    styles.useVariants({
      direction,
    })

    return (
      <ResizableContext.Provider
        value={{
          direction,
          sizes: resolvedSizes,
          panelCount,
          containerSize,
          setContainerSize,
          registerPanel,
          resizeByDelta,
          resizeByPercent,
        }}
      >
        <View
          ref={ref}
          role={Platform.OS === "web" ? "group" : undefined}
          style={[styles.group, style]}
          onLayout={handleLayout}
          {...props}
        >
          {enhancedChildren}
        </View>
      </ResizableContext.Provider>
    )
  },
)

ResizablePanelGroup.displayName = "ResizablePanelGroup"

export const ResizablePanel = React.forwardRef<View, ResizablePanelProps>(
  ({ minSize, maxSize, style, _index, ...props }, ref) => {
    const { direction, sizes, registerPanel } = useResizable()
    const index = typeof _index === "number" ? _index : undefined

    React.useEffect(() => {
      if (index === undefined) return
      return registerPanel(index, { minSize, maxSize })
    }, [index, maxSize, minSize, registerPanel])

    const size = index !== undefined ? sizes[index] : undefined
    const sizeValue = size !== undefined ? (`${size}%` as const) : undefined
    const sizeStyle: ViewStyle =
      sizeValue !== undefined
        ? direction === "horizontal"
          ? { width: sizeValue }
          : { height: sizeValue }
        : { flex: 1 }

    return (
      <View
        ref={ref}
        style={[styles.panel, sizeStyle, style]}
        {...props}
      />
    )
  },
)

ResizablePanel.displayName = "ResizablePanel"

export const ResizableHandle = React.forwardRef<View, ResizableHandleProps>(
  ({ disabled, withHandle = false, keyboardStep = 2, style, _index, ...props }, ref) => {
    const { direction, resizeByDelta, resizeByPercent, sizes } = useResizable()
    const isDisabled = !!disabled
    const index = typeof _index === "number" ? _index : -1
    const isHorizontal = direction === "horizontal"

    const lastDeltaRef = React.useRef(0)
    const [dragging, setDragging] = React.useState(false)

    const panResponder = React.useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => !isDisabled,
          onMoveShouldSetPanResponder: () => !isDisabled,
          onPanResponderGrant: () => {
            lastDeltaRef.current = 0
            setDragging(true)
          },
          onPanResponderMove: (_event, gestureState) => {
            if (isDisabled) return
            const deltaPx = isHorizontal ? gestureState.dx : gestureState.dy
            const delta = deltaPx - lastDeltaRef.current
            lastDeltaRef.current = deltaPx
            resizeByDelta(index, delta)
          },
          onPanResponderRelease: () => {
            lastDeltaRef.current = 0
            setDragging(false)
          },
          onPanResponderTerminate: () => {
            lastDeltaRef.current = 0
            setDragging(false)
          },
        }),
      [index, isDisabled, isHorizontal, resizeByDelta],
    )

    const handleKeyDown = React.useCallback(
      (event: { key?: string; preventDefault?: () => void }) => {
        if (Platform.OS !== "web" || isDisabled) return
        const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp"
        const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown"
        if (event.key === prevKey) {
          event.preventDefault?.()
          resizeByPercent(index, -keyboardStep)
        }
        if (event.key === nextKey) {
          event.preventDefault?.()
          resizeByPercent(index, keyboardStep)
        }
      },
      [index, isDisabled, isHorizontal, keyboardStep, resizeByPercent],
    )

    styles.useVariants({
      orientation: isHorizontal ? "horizontal" : "vertical",
      dragging: dragging ? true : undefined,
      disabled: isDisabled,
    })

    return (
      <View
        ref={ref}
        role={Platform.OS === "web" ? "separator" : undefined}
        aria-orientation={Platform.OS === "web" ? direction : undefined}
        aria-disabled={Platform.OS === "web" ? isDisabled : undefined}
        aria-valuenow={
          Platform.OS === "web" && sizes[index] !== undefined
            ? Math.round(sizes[index])
            : undefined
        }
        accessibilityRole="adjustable"
        accessibilityState={{ disabled: isDisabled }}
        style={[styles.handle, style]}
        tabIndex={Platform.OS === "web" ? 0 : undefined}
        // @ts-expect-error - onKeyDown is web-only
        onKeyDown={Platform.OS === "web" ? handleKeyDown : undefined}
        {...panResponder.panHandlers}
        {...props}
      >
        {withHandle ? <View style={styles.handleGrip} /> : null}
      </View>
    )
  },
)

ResizableHandle.displayName = "ResizableHandle"

const styles = StyleSheet.create((theme) => ({
  group: {
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
    height: "100%",
    variants: {
      direction: {
        horizontal: {
          flexDirection: "row",
        },
        vertical: {
          flexDirection: "column",
        },
      },
    },
  },
  panel: {
    flexGrow: 0,
    flexShrink: 0,
    overflow: "hidden",
  },
  handle: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    variants: {
      orientation: {
        horizontal: {
          width: 8,
          height: "100%",
        },
        vertical: {
          height: 8,
          width: "100%",
        },
      },
      dragging: {
        true: {
          backgroundColor: theme.colors.muted,
        },
      },
      disabled: {
        true: {
          opacity: 0.5,
        },
      },
    },
  },
  handleGrip: {
    width: 2,
    height: 24,
    borderRadius: 999,
    backgroundColor: theme.colors.border,
    variants: {
      orientation: {
        horizontal: {},
        vertical: {
          width: 24,
          height: 2,
        },
      },
    },
  },
}))
