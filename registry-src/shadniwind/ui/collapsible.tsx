import * as React from "react"
import {
  Animated,
  Platform,
  Pressable,
  type PressableProps,
  View,
  type ViewProps,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"

type CollapsibleContextValue = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CollapsibleContext = React.createContext<
  CollapsibleContextValue | undefined
>(undefined)

function useCollapsible() {
  const context = React.useContext(CollapsibleContext)
  if (!context) {
    throw new Error("Collapsible components must be used within Collapsible")
  }
  return context
}

export type CollapsibleProps = ViewProps & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
}

export const Collapsible = React.forwardRef<
  React.ComponentRef<typeof View>,
  CollapsibleProps
>(
  (
    {
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      disabled = false,
      children,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledOpen, setUncontrolledOpen] =
      React.useState<boolean>(defaultOpen)

    const isControlled = openProp !== undefined
    const open = isControlled ? openProp : uncontrolledOpen

    const handleOpenChange = React.useCallback(
      (newOpen: boolean) => {
        if (disabled) return

        if (!isControlled) {
          setUncontrolledOpen(newOpen)
        }

        onOpenChange?.(newOpen)
      },
      [disabled, isControlled, onOpenChange],
    )

    return (
      <CollapsibleContext.Provider
        value={{ open, onOpenChange: handleOpenChange }}
      >
        <View ref={ref} {...props}>
          {children}
        </View>
      </CollapsibleContext.Provider>
    )
  },
)

Collapsible.displayName = "Collapsible"

export type CollapsibleTriggerProps = PressableProps

export const CollapsibleTrigger = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  CollapsibleTriggerProps
>(({ onPress, children, ...props }, ref) => {
  const { open, onOpenChange } = useCollapsible()

  const handlePress = React.useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: Event handler type
    (event: any) => {
      onOpenChange(!open)
      onPress?.(event)
    },
    [open, onOpenChange, onPress],
  )

  return (
    <Pressable
      ref={ref}
      role={Platform.OS === "web" ? "button" : undefined}
      aria-expanded={Platform.OS === "web" ? open : undefined}
      accessible={true}
      accessibilityRole="button"
      accessibilityState={{
        expanded: open,
      }}
      onPress={handlePress}
      {...props}
    >
      {children}
    </Pressable>
  )
})

CollapsibleTrigger.displayName = "CollapsibleTrigger"

export type CollapsibleContentProps = ViewProps

export const CollapsibleContent = React.forwardRef<
  React.ComponentRef<typeof View>,
  CollapsibleContentProps
>(({ children, style, ...props }, ref) => {
  const { open } = useCollapsible()
  const animatedHeight = React.useRef(new Animated.Value(open ? 1 : 0)).current
  const [contentHeight, setContentHeight] = React.useState<number>(0)

  React.useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: open ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [open, animatedHeight])

  const handleLayout = React.useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: Layout event type
    (event: any) => {
      const { height } = event.nativeEvent.layout
      if (height > 0 && height !== contentHeight) {
        setContentHeight(height)
      }
    },
    [contentHeight],
  )

  const heightInterpolation = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight],
  })

  // Always measure content height before rendering animated view
  if (contentHeight === 0) {
    return (
      <View onLayout={handleLayout} style={[styles.measuringContainer, style]}>
        {children}
      </View>
    )
  }

  return (
    <Animated.View
      ref={ref}
      role={Platform.OS === "web" ? "region" : undefined}
      style={[
        styles.content,
        {
          height: heightInterpolation,
          opacity: animatedHeight,
        },
        style,
      ]}
      {...props}
    >
      <View onLayout={handleLayout}>{children}</View>
    </Animated.View>
  )
})

CollapsibleContent.displayName = "CollapsibleContent"

const styles = StyleSheet.create(() => ({
  content: {
    overflow: "hidden",
  },
  measuringContainer: {
    position: "absolute",
    opacity: 0,
    zIndex: -1,
  },
}))
