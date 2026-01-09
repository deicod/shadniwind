import * as React from "react"
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  Text,
  type TextProps,
  type TextStyle,
  useWindowDimensions,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"
import { FocusScope } from "../primitives/focus/index.js"
import { DismissLayer } from "../primitives/overlay/index.js"
import { Portal } from "../primitives/portal/index.js"
import { composeEventHandlers } from "../primitives/press/index.js"
import { useScrollLock } from "../primitives/scroll-lock/index.js"

type DrawerContextValue = {
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerRef: React.RefObject<View | null>
  contentRef: React.RefObject<View | null>
  titleId: string
  descriptionId: string
  modal: boolean
}

const DrawerContext = React.createContext<DrawerContextValue | undefined>(
  undefined,
)

function useDrawer() {
  const context = React.useContext(DrawerContext)
  if (!context) {
    throw new Error("Drawer components must be used within a Drawer")
  }
  return context
}

export type DrawerProps = {
  children: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
}

export function Drawer({
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  modal = true,
}: DrawerProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const triggerRef = React.useRef<View>(null)
  const contentRef = React.useRef<View>(null)
  const titleId = React.useId()
  const descriptionId = React.useId()

  const isControlled = openProp !== undefined
  const isOpen = isControlled ? openProp : open

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange],
  )

  return (
    <DrawerContext.Provider
      value={{
        open: !!isOpen,
        onOpenChange: handleOpenChange,
        triggerRef,
        contentRef,
        titleId,
        descriptionId,
        modal,
      }}
    >
      {children}
    </DrawerContext.Provider>
  )
}

export type DrawerTriggerProps = PressableProps & { asChild?: boolean }

export const DrawerTrigger = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  DrawerTriggerProps
>(({ children, asChild, onPress, disabled, ...props }, ref) => {
  const { open, onOpenChange, triggerRef } = useDrawer()
  const isDisabled = !!disabled

  const handlePress = React.useCallback(
    (event: unknown) => {
      if (isDisabled) return
      onOpenChange(!open)
      // @ts-expect-error - React Native event type
      onPress?.(event)
    },
    [isDisabled, open, onOpenChange, onPress],
  )

  React.useEffect(() => {
    if (ref) {
      if (typeof ref === "function") {
        ref(triggerRef.current)
      } else {
        ;(ref as { current: View | null }).current = triggerRef.current
      }
    }
  }, [ref, triggerRef])

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onPress?: (event: unknown) => void
    }>
    const childOnPress = isDisabled ? undefined : child.props.onPress
    // biome-ignore lint/suspicious/noExplicitAny: Cloning logic
    return React.cloneElement(child as React.ReactElement<any>, {
      ref: triggerRef,
      onPress: composeEventHandlers(childOnPress, handlePress),
      role: Platform.OS === "web" ? "button" : undefined,
      "aria-expanded": Platform.OS === "web" ? open : undefined,
      "aria-haspopup": Platform.OS === "web" ? "dialog" : undefined,
      accessibilityRole: "button",
      accessibilityState: {
        expanded: open,
        disabled: isDisabled,
      },
      disabled,
      ...props,
    })
  }

  return (
    <Pressable
      ref={triggerRef}
      role={Platform.OS === "web" ? "button" : undefined}
      aria-expanded={Platform.OS === "web" ? open : undefined}
      aria-haspopup={Platform.OS === "web" ? "dialog" : undefined}
      accessibilityRole="button"
      accessibilityState={{
        expanded: open,
        disabled: isDisabled,
      }}
      disabled={disabled}
      onPress={handlePress}
      {...props}
    >
      {children}
    </Pressable>
  )
})

DrawerTrigger.displayName = "DrawerTrigger"

export type DrawerCloseProps = PressableProps & { asChild?: boolean }

export const DrawerClose = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  DrawerCloseProps
>(({ children, asChild, onPress, disabled, ...props }, ref) => {
  const { onOpenChange } = useDrawer()
  const isDisabled = !!disabled

  const handlePress = React.useCallback(
    (event: unknown) => {
      if (isDisabled) return
      onOpenChange(false)
      // @ts-expect-error - React Native event type
      onPress?.(event)
    },
    [isDisabled, onOpenChange, onPress],
  )

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onPress?: (event: unknown) => void
    }>
    const childOnPress = isDisabled ? undefined : child.props.onPress
    // biome-ignore lint/suspicious/noExplicitAny: Cloning logic
    return React.cloneElement(child as React.ReactElement<any>, {
      ref,
      onPress: composeEventHandlers(childOnPress, handlePress),
      accessibilityRole: "button",
      accessibilityState: {
        disabled: isDisabled,
      },
      disabled,
      ...props,
    })
  }

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={disabled}
      onPress={handlePress}
      {...props}
    >
      {children}
    </Pressable>
  )
})

DrawerClose.displayName = "DrawerClose"

export type DrawerSide = "bottom" | "left" | "right" | "top"

export type DrawerContentProps = ViewProps & {
  side?: DrawerSide
  overlayStyle?: StyleProp<ViewStyle>
  dismissable?: boolean
  onDismiss?: () => void
}

export const DrawerContent = React.forwardRef<View, DrawerContentProps>(
  (
    {
      children,
      style,
      overlayStyle,
      side = "bottom",
      dismissable,
      onDismiss,
      ...props
    },
    ref,
  ) => {
    const {
      open,
      onOpenChange,
      contentRef,
      titleId,
      descriptionId,
      modal,
    } = useDrawer()
    const { width, height } = useWindowDimensions()
    const translate = React.useRef(new Animated.Value(open ? 0 : 1)).current
    const [mounted, setMounted] = React.useState(open)
    const prevOpenRef = React.useRef(open)

    React.useEffect(() => {
      translate.stopAnimation()
      const wasOpen = prevOpenRef.current

      if (open && !wasOpen) {
        setMounted(true)
        translate.setValue(1)
        Animated.timing(translate, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start()
      }

      if (!open && wasOpen) {
        Animated.timing(translate, {
          toValue: 1,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) {
            setMounted(false)
          }
        })
      }

      prevOpenRef.current = open
    }, [open, translate])

    const isVisible = mounted
    useScrollLock(isVisible && modal)
    const variantStyles = styles.useVariants({
      side,
    }) as unknown
    const contentVariantStyle =
      variantStyles &&
      typeof variantStyles === "object" &&
      "content" in variantStyles
        ? (variantStyles as typeof styles).content
        : variantStyles

    const handleDismiss = React.useCallback(() => {
      onOpenChange(false)
      onDismiss?.()
    }, [onOpenChange, onDismiss])

    const setContentRef = React.useCallback(
      (node: View | null) => {
        contentRef.current = node
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ;(ref as { current: View | null }).current = node
        }
      },
      [ref, contentRef],
    )

    const animatedStyle = React.useMemo(() => {
      const distance =
        side === "left" || side === "right" ? width : height
      if (side === "left" || side === "right") {
        const direction = side === "left" ? -1 : 1
        return {
          transform: [
            {
              translateX: translate.interpolate({
                inputRange: [0, 1],
                outputRange: [0, direction * distance],
              }),
            },
          ],
        }
      }

      const direction = side === "top" ? -1 : 1
      return {
        transform: [
          {
            translateY: translate.interpolate({
              inputRange: [0, 1],
              outputRange: [0, direction * distance],
            }),
          },
        ],
      }
    }, [height, side, translate, width])

    if (!isVisible) return null

    const isDismissable = dismissable ?? modal

    return (
      <Portal>
        <DismissLayer
          onDismiss={handleDismiss}
          dismissable={isDismissable}
          scrim={modal}
          scrimStyle={[styles.overlay, overlayStyle]}
        >
          <FocusScope trapped={modal} loop={true} style={styles.container}>
            <Animated.View
              ref={setContentRef}
              role={Platform.OS === "web" ? "dialog" : undefined}
              aria-modal={Platform.OS === "web" ? modal : undefined}
              aria-labelledby={Platform.OS === "web" ? titleId : undefined}
              aria-describedby={Platform.OS === "web" ? descriptionId : undefined}
              accessibilityViewIsModal={modal}
              style={
                [
                  styles.content,
                  contentVariantStyle,
                  animatedStyle,
                  style,
                  // biome-ignore lint/suspicious/noExplicitAny: Animated style arrays are dynamic.
                ] as any
              }
              {...props}
            >
              {children}
            </Animated.View>
          </FocusScope>
        </DismissLayer>
      </Portal>
    )
  },
)

DrawerContent.displayName = "DrawerContent"

export type DrawerHeaderProps = ViewProps & {
  style?: StyleProp<ViewStyle>
}

export const DrawerHeader = React.forwardRef<View, DrawerHeaderProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.header, style]} {...props} />
  },
)

DrawerHeader.displayName = "DrawerHeader"

export type DrawerFooterProps = ViewProps & {
  style?: StyleProp<ViewStyle>
}

export const DrawerFooter = React.forwardRef<View, DrawerFooterProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.footer, style]} {...props} />
  },
)

DrawerFooter.displayName = "DrawerFooter"

export type DrawerTitleProps = TextProps & {
  style?: StyleProp<TextStyle>
}

export const DrawerTitle = React.forwardRef<Text, DrawerTitleProps>(
  ({ style, ...props }, ref) => {
    const { titleId } = useDrawer()
    return (
      <Text ref={ref} nativeID={titleId} style={[styles.title, style]} {...props} />
    )
  },
)

DrawerTitle.displayName = "DrawerTitle"

export type DrawerDescriptionProps = TextProps & {
  style?: StyleProp<TextStyle>
}

export const DrawerDescription = React.forwardRef<Text, DrawerDescriptionProps>(
  ({ style, ...props }, ref) => {
    const { descriptionId } = useDrawer()
    return (
      <Text
        ref={ref}
        nativeID={descriptionId}
        style={[styles.description, style]}
        {...props}
      />
    )
  },
)

DrawerDescription.displayName = "DrawerDescription"

const styles = StyleSheet.create((theme) => ({
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    flex: 1,
  },
  content: {
    position: "absolute",
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    padding: theme.spacing[6],
    shadowColor: theme.colors.foreground,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    variants: {
      side: {
        bottom: {
          left: 0,
          right: 0,
          bottom: 0,
          height: "60%",
          maxHeight: 640,
          borderBottomWidth: 0,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        },
        top: {
          left: 0,
          right: 0,
          top: 0,
          height: "60%",
          maxHeight: 640,
          borderTopWidth: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        },
        right: {
          top: 0,
          bottom: 0,
          right: 0,
          width: "80%",
          maxWidth: 480,
          borderRightWidth: 0,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        },
        left: {
          top: 0,
          bottom: 0,
          left: 0,
          width: "80%",
          maxWidth: 480,
          borderLeftWidth: 0,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        },
      },
    },
  },
  header: {
    marginBottom: theme.spacing[4],
    gap: theme.spacing[1],
  },
  footer: {
    marginTop: theme.spacing[4],
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: theme.spacing[2],
    flexWrap: "wrap",
  },
  title: {
    color: theme.colors.foreground,
    fontFamily: theme.typography.families.sans,
    fontSize: theme.typography.sizes.lg,
    lineHeight: theme.typography.lineHeights.lg,
    fontWeight: theme.typography.weights.semibold,
  },
  description: {
    color: theme.colors.mutedForeground,
    fontFamily: theme.typography.families.sans,
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.md,
  },
}))
