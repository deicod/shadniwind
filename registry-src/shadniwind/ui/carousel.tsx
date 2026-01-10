import * as React from "react"
import {
  Platform,
  Pressable,
  type PressableProps,
  ScrollView,
  type ScrollViewProps,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  Text,
  View,
  type ViewProps,
  type ViewStyle,
  type TextStyle,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"

type CarouselOrientation = "horizontal" | "vertical"

type CarouselContextValue = {
  orientation: CarouselOrientation
  itemSize?: number
  itemSpacing: number
  loop: boolean
  currentIndex: number
  itemCount: number
  snapInterval: number
  containerSize: number
  setContainerSize: (size: number) => void
  setItemCount: (count: number) => void
  scrollRef: React.RefObject<ScrollView | null>
  scrollToIndex: (index: number, options?: { animated?: boolean }) => void
  handleIndexChange: (index: number) => void
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error("Carousel components must be used within a Carousel")
  }
  return context
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export type CarouselProps = ViewProps & {
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  itemSize?: number
  itemSpacing?: number
  orientation?: CarouselOrientation
  loop?: boolean
}

/**
 * Carousel component for swipeable, snapped paging.
 *
 * Native: swipe gestures via ScrollView.
 * Web: arrow key navigation when focused.
 *
 * Limitations:
 * - Assumes uniform item size (snapToInterval).
 * - No virtualization; keep item counts modest.
 */
export const Carousel = React.forwardRef<View, CarouselProps>(
  (
    {
      index: indexProp,
      defaultIndex = 0,
      onIndexChange,
      itemSize,
      itemSpacing = 0,
      orientation = "horizontal",
      loop = false,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledIndex, setUncontrolledIndex] =
      React.useState(defaultIndex)
    const [containerSize, setContainerSize] = React.useState(0)
    const [itemCount, setItemCount] = React.useState(0)
    const scrollRef = React.useRef<ScrollView | null>(null)

    const isControlled = indexProp !== undefined
    const currentIndex = isControlled ? indexProp : uncontrolledIndex

    const snapInterval = React.useMemo(() => {
      const size = itemSize ?? containerSize
      if (!Number.isFinite(size) || size <= 0) return 0
      return size + itemSpacing
    }, [itemSize, containerSize, itemSpacing])

    const handleIndexChange = React.useCallback(
      (nextIndex: number) => {
        const maxIndex = Math.max(itemCount - 1, 0)
        const resolvedIndex =
          loop && itemCount > 0
            ? ((nextIndex % itemCount) + itemCount) % itemCount
            : clamp(nextIndex, 0, maxIndex)

        if (!isControlled) {
          setUncontrolledIndex(resolvedIndex)
        }
        onIndexChange?.(resolvedIndex)
      },
      [isControlled, itemCount, loop, onIndexChange],
    )

    const scrollToIndex = React.useCallback(
      (nextIndex: number, options?: { animated?: boolean }) => {
        if (itemCount <= 0) {
          handleIndexChange(0)
          return
        }

        const resolvedIndex = loop
          ? ((nextIndex % itemCount) + itemCount) % itemCount
          : clamp(nextIndex, 0, itemCount - 1)

        handleIndexChange(resolvedIndex)

        if (snapInterval <= 0) return

        const offset = snapInterval * resolvedIndex
        scrollRef.current?.scrollTo({
          x: orientation === "horizontal" ? offset : 0,
          y: orientation === "horizontal" ? 0 : offset,
          animated: options?.animated ?? true,
        })
      },
      [handleIndexChange, itemCount, loop, snapInterval, orientation],
    )

    React.useEffect(() => {
      if (itemCount <= 0) return
      if (currentIndex > itemCount - 1) {
        handleIndexChange(itemCount - 1)
      }
    }, [currentIndex, handleIndexChange, itemCount])

    return (
      <CarouselContext.Provider
        value={{
          orientation,
          itemSize,
          itemSpacing,
          loop,
          currentIndex,
          itemCount,
          snapInterval,
          containerSize,
          setContainerSize,
          setItemCount,
          scrollRef,
          scrollToIndex,
          handleIndexChange,
        }}
      >
        <View ref={ref} style={[styles.root, style]} {...props}>
          {children}
        </View>
      </CarouselContext.Provider>
    )
  },
)

Carousel.displayName = "Carousel"

export type CarouselContentProps = Omit<ScrollViewProps, "horizontal"> & {
  onKeyDown?: (event: unknown) => void
}

export const CarouselContent = React.forwardRef<
  React.ComponentRef<typeof ScrollView>,
  CarouselContentProps
>(
  (
    {
      style,
      contentContainerStyle,
      onLayout,
      onMomentumScrollEnd,
      onScrollEndDrag,
      onKeyDown,
      snapToInterval: snapToIntervalProp,
      snapToAlignment: snapToAlignmentProp,
      pagingEnabled: pagingEnabledProp,
      decelerationRate: decelerationRateProp,
      showsHorizontalScrollIndicator = false,
      showsVerticalScrollIndicator = false,
      children,
      ...props
    },
    ref,
  ) => {
    const {
      orientation,
      itemSize,
      itemSpacing,
      snapInterval,
      containerSize,
      setContainerSize,
      setItemCount,
      scrollRef,
      scrollToIndex,
      handleIndexChange,
      currentIndex,
    } = useCarousel()

    const isHorizontal = orientation === "horizontal"

    const setScrollRef = React.useCallback(
      (node: React.ComponentRef<typeof ScrollView> | null) => {
        scrollRef.current = node
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ;(
            ref as React.MutableRefObject<
              React.ComponentRef<typeof ScrollView> | null
            >
          ).current = node
        }
      },
      [ref, scrollRef],
    )

    const handleLayout = React.useCallback(
      (event: LayoutChangeEvent) => {
        const size = isHorizontal
          ? event.nativeEvent.layout.width
          : event.nativeEvent.layout.height
        setContainerSize(size)
        onLayout?.(event)
      },
      [isHorizontal, onLayout, setContainerSize],
    )

    const childCount = React.Children.count(children)

    React.useEffect(() => {
      setItemCount(childCount)
    }, [childCount, setItemCount])

    React.useEffect(() => {
      if (snapInterval <= 0) return
      const offset = snapInterval * currentIndex
      scrollRef.current?.scrollTo({
        x: isHorizontal ? offset : 0,
        y: isHorizontal ? 0 : offset,
        animated: false,
      })
    }, [currentIndex, isHorizontal, snapInterval, scrollRef])

    const handleScrollEnd = React.useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (snapInterval > 0) {
          const offset = isHorizontal
            ? event.nativeEvent.contentOffset.x
            : event.nativeEvent.contentOffset.y
          const nextIndex = Math.round(offset / snapInterval)
          handleIndexChange(nextIndex)
        }
        onMomentumScrollEnd?.(event)
      },
      [handleIndexChange, isHorizontal, onMomentumScrollEnd, snapInterval],
    )

    const handleScrollEndDrag = React.useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (snapInterval > 0) {
          const offset = isHorizontal
            ? event.nativeEvent.contentOffset.x
            : event.nativeEvent.contentOffset.y
          const nextIndex = Math.round(offset / snapInterval)
          handleIndexChange(nextIndex)
        }
        onScrollEndDrag?.(event)
      },
      [handleIndexChange, isHorizontal, onScrollEndDrag, snapInterval],
    )

    const handleKeyDown = React.useCallback(
      (event: {
        key?: string
        preventDefault?: () => void
        defaultPrevented?: boolean
      }) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return

        const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp"
        const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown"

        if (event.key === prevKey) {
          event.preventDefault?.()
          scrollToIndex(currentIndex - 1)
        }
        if (event.key === nextKey) {
          event.preventDefault?.()
          scrollToIndex(currentIndex + 1)
        }
      },
      [currentIndex, isHorizontal, onKeyDown, scrollToIndex],
    )

    const shouldPage =
      snapInterval > 0 &&
      itemSpacing === 0 &&
      (itemSize ?? containerSize) === containerSize
    const resolvedPagingEnabled = pagingEnabledProp ?? shouldPage
    const resolvedSnapToInterval =
      snapToIntervalProp ?? (resolvedPagingEnabled ? undefined : snapInterval || undefined)
    const resolvedDecelerationRate =
      decelerationRateProp ?? (snapInterval > 0 ? "fast" : undefined)

    const contentStyle: StyleProp<ViewStyle> = [
      styles.content,
      isHorizontal ? styles.contentHorizontal : styles.contentVertical,
      contentContainerStyle,
    ]

    return (
      <ScrollView
        ref={setScrollRef}
        horizontal={isHorizontal}
        style={[styles.viewport, style]}
        contentContainerStyle={contentStyle}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        decelerationRate={resolvedDecelerationRate}
        pagingEnabled={resolvedPagingEnabled}
        snapToInterval={resolvedSnapToInterval}
        snapToAlignment={snapToAlignmentProp}
        onLayout={handleLayout}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEndDrag}
        role={Platform.OS === "web" ? "region" : undefined}
        tabIndex={Platform.OS === "web" ? 0 : undefined}
        // @ts-expect-error - onKeyDown is web-only
        onKeyDown={Platform.OS === "web" ? handleKeyDown : undefined}
        {...props}
      >
        {children}
      </ScrollView>
    )
  },
)

CarouselContent.displayName = "CarouselContent"

export type CarouselItemProps = ViewProps

export const CarouselItem = React.forwardRef<View, CarouselItemProps>(
  ({ style, ...props }, ref) => {
    const { orientation, itemSize, containerSize, itemSpacing } = useCarousel()
    const isHorizontal = orientation === "horizontal"
    const size = itemSize ?? containerSize

    const sizeStyle: ViewStyle = isHorizontal
      ? { width: size > 0 ? size : "100%" }
      : { height: size > 0 ? size : "100%" }

    const spacingStyle: ViewStyle = isHorizontal
      ? { marginRight: itemSpacing }
      : { marginBottom: itemSpacing }

    return (
      <View
        ref={ref}
        style={[styles.item, sizeStyle, spacingStyle, style]}
        {...props}
      />
    )
  },
)

CarouselItem.displayName = "CarouselItem"

export type CarouselControlProps = PressableProps & {
  disabled?: boolean
  textStyle?: StyleProp<TextStyle>
}

export const CarouselPrevious = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  CarouselControlProps
>(({ style, textStyle, disabled, children, ...props }, ref) => {
  const { currentIndex, itemCount, loop, orientation, scrollToIndex } =
    useCarousel()
  const isHorizontal = orientation === "horizontal"
  const autoDisabled =
    itemCount <= 0 ? true : !loop && currentIndex <= 0
  const isDisabled = disabled ?? autoDisabled
  const variantStyles = styles.useVariants({ disabled: isDisabled })

  return (
    <Pressable
      ref={ref}
      role={Platform.OS === "web" ? "button" : undefined}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={() => {
        if (isDisabled) return
        scrollToIndex(currentIndex - 1)
      }}
      disabled={isDisabled}
      style={({ pressed }) =>
        [
          styles.control,
          isHorizontal ? styles.controlPrev : styles.controlUp,
          variantStyles,
          pressed && !isDisabled && styles.controlPressed,
          typeof style === "function" ? style({ pressed }) : style,
          // biome-ignore lint/suspicious/noExplicitAny: Style array type assertion
        ] as any
      }
      {...props}
    >
      {children ?? <Text style={[styles.controlText, textStyle]}>Prev</Text>}
    </Pressable>
  )
})

CarouselPrevious.displayName = "CarouselPrevious"

export const CarouselNext = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  CarouselControlProps
>(({ style, textStyle, disabled, children, ...props }, ref) => {
  const { currentIndex, itemCount, loop, orientation, scrollToIndex } =
    useCarousel()
  const isHorizontal = orientation === "horizontal"
  const autoDisabled =
    itemCount <= 0 ? true : !loop && currentIndex >= itemCount - 1
  const isDisabled = disabled ?? autoDisabled
  const variantStyles = styles.useVariants({ disabled: isDisabled })

  return (
    <Pressable
      ref={ref}
      role={Platform.OS === "web" ? "button" : undefined}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={() => {
        if (isDisabled) return
        scrollToIndex(currentIndex + 1)
      }}
      disabled={isDisabled}
      style={({ pressed }) =>
        [
          styles.control,
          isHorizontal ? styles.controlNext : styles.controlDown,
          variantStyles,
          pressed && !isDisabled && styles.controlPressed,
          typeof style === "function" ? style({ pressed }) : style,
          // biome-ignore lint/suspicious/noExplicitAny: Style array type assertion
        ] as any
      }
      {...props}
    >
      {children ?? <Text style={[styles.controlText, textStyle]}>Next</Text>}
    </Pressable>
  )
})

CarouselNext.displayName = "CarouselNext"

const styles = StyleSheet.create((theme) => ({
  root: {
    position: "relative",
    width: "100%",
  },
  viewport: {
    width: "100%",
  },
  content: {
    alignItems: "stretch",
  },
  contentHorizontal: {
    flexDirection: "row",
  },
  contentVertical: {
    flexDirection: "column",
  },
  item: {
    flexGrow: 0,
    flexShrink: 0,
  },
  control: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    variants: {
      disabled: {
        true: {
          opacity: 0.5,
        },
      },
    },
  },
  controlPressed: {
    opacity: 0.8,
  },
  controlText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.foreground,
  },
  controlPrev: {
    left: theme.spacing[2],
    top: "50%",
    transform: [{ translateY: -16 }],
  },
  controlNext: {
    right: theme.spacing[2],
    top: "50%",
    transform: [{ translateY: -16 }],
  },
  controlUp: {
    top: theme.spacing[2],
    left: "50%",
    transform: [{ translateX: -16 }],
  },
  controlDown: {
    bottom: theme.spacing[2],
    left: "50%",
    transform: [{ translateX: -16 }],
  },
}))
