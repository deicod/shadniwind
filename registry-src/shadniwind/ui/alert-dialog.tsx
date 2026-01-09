import * as React from "react"
import {
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  Text,
  type TextProps,
  type TextStyle,
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

type AlertDialogContextValue = {
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerRef: React.RefObject<View | null>
  contentRef: React.RefObject<View | null>
  titleId: string
  descriptionId: string
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | undefined>(
  undefined,
)

function useAlertDialog() {
  const context = React.useContext(AlertDialogContext)
  if (!context) {
    throw new Error("AlertDialog components must be used within an AlertDialog")
  }
  return context
}

export type AlertDialogProps = {
  children: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AlertDialog({
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
}: AlertDialogProps) {
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
    <AlertDialogContext.Provider
      value={{
        open: !!isOpen,
        onOpenChange: handleOpenChange,
        triggerRef,
        contentRef,
        titleId,
        descriptionId,
      }}
    >
      {children}
    </AlertDialogContext.Provider>
  )
}

export type AlertDialogTriggerProps = PressableProps & { asChild?: boolean }

export const AlertDialogTrigger = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  AlertDialogTriggerProps
>(({ children, asChild, onPress, disabled, ...props }, ref) => {
  const { open, onOpenChange, triggerRef } = useAlertDialog()
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

AlertDialogTrigger.displayName = "AlertDialogTrigger"

export type AlertDialogContentSize = "default" | "sm" | "lg" | "fullscreen"

export type AlertDialogContentProps = ViewProps & {
  size?: AlertDialogContentSize
  overlayStyle?: StyleProp<ViewStyle>
  dismissable?: boolean
  onDismiss?: () => void
}

export const AlertDialogContent = React.forwardRef<View, AlertDialogContentProps>(
  (
    {
      children,
      style,
      overlayStyle,
      size = "default",
      dismissable = false,
      onDismiss,
      ...props
    },
    ref,
  ) => {
    const { open, onOpenChange, contentRef, titleId, descriptionId } =
      useAlertDialog()

    useScrollLock(open)
    const variantStyles = styles.useVariants({
      size: size === "default" ? undefined : size,
    })

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

    if (!open) return null

    return (
      <Portal>
        <DismissLayer
          onDismiss={handleDismiss}
          dismissable={dismissable}
          scrim={true}
          scrimStyle={[styles.overlay, overlayStyle]}
        >
          <FocusScope trapped={true} loop={true} style={styles.center}>
            <View
              ref={setContentRef}
              role={Platform.OS === "web" ? "alertdialog" : undefined}
              aria-modal={Platform.OS === "web" ? true : undefined}
              aria-labelledby={Platform.OS === "web" ? titleId : undefined}
              aria-describedby={Platform.OS === "web" ? descriptionId : undefined}
              accessibilityViewIsModal={true}
              style={
                [
                  styles.content,
                  variantStyles,
                  style,
                  // biome-ignore lint/suspicious/noExplicitAny: Style array may include variant styles.
                ] as any
              }
              {...props}
            >
              {children}
            </View>
          </FocusScope>
        </DismissLayer>
      </Portal>
    )
  },
)

AlertDialogContent.displayName = "AlertDialogContent"

export type AlertDialogHeaderProps = ViewProps & {
  style?: StyleProp<ViewStyle>
}

export const AlertDialogHeader = React.forwardRef<View, AlertDialogHeaderProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.header, style]} {...props} />
  },
)

AlertDialogHeader.displayName = "AlertDialogHeader"

export type AlertDialogFooterProps = ViewProps & {
  style?: StyleProp<ViewStyle>
}

export const AlertDialogFooter = React.forwardRef<View, AlertDialogFooterProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.footer, style]} {...props} />
  },
)

AlertDialogFooter.displayName = "AlertDialogFooter"

export type AlertDialogTitleProps = TextProps & {
  style?: StyleProp<TextStyle>
}

export const AlertDialogTitle = React.forwardRef<Text, AlertDialogTitleProps>(
  ({ style, ...props }, ref) => {
    const { titleId } = useAlertDialog()
    return (
      <Text ref={ref} nativeID={titleId} style={[styles.title, style]} {...props} />
    )
  },
)

AlertDialogTitle.displayName = "AlertDialogTitle"

export type AlertDialogDescriptionProps = TextProps & {
  style?: StyleProp<TextStyle>
}

export const AlertDialogDescription = React.forwardRef<
  Text,
  AlertDialogDescriptionProps
>(({ style, ...props }, ref) => {
  const { descriptionId } = useAlertDialog()
  return (
    <Text
      ref={ref}
      nativeID={descriptionId}
      style={[styles.description, style]}
      {...props}
    />
  )
})

AlertDialogDescription.displayName = "AlertDialogDescription"

export type AlertDialogActionProps = PressableProps & { asChild?: boolean }

export const AlertDialogAction = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  AlertDialogActionProps
>(({ children, asChild, onPress, disabled, style, ...props }, ref) => {
  const { onOpenChange } = useAlertDialog()
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
      role={Platform.OS === "web" ? "button" : undefined}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={handlePress}
      style={({ pressed }) =>
        [
          styles.action,
          isDisabled && styles.actionDisabled,
          pressed && !isDisabled && styles.actionPressed,
          typeof style === "function" ? style({ pressed }) : style,
        ] as unknown as StyleProp<ViewStyle>
      }
      {...props}
    >
      {typeof children === "string" ? (
        <Text style={styles.actionText}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  )
})

AlertDialogAction.displayName = "AlertDialogAction"

export type AlertDialogCancelProps = PressableProps & { asChild?: boolean }

export const AlertDialogCancel = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  AlertDialogCancelProps
>(({ children, asChild, onPress, disabled, style, ...props }, ref) => {
  const { onOpenChange } = useAlertDialog()
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
      role={Platform.OS === "web" ? "button" : undefined}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={handlePress}
      style={({ pressed }) =>
        [
          styles.cancel,
          isDisabled && styles.cancelDisabled,
          pressed && !isDisabled && styles.cancelPressed,
          typeof style === "function" ? style({ pressed }) : style,
        ] as unknown as StyleProp<ViewStyle>
      }
      {...props}
    >
      {typeof children === "string" ? (
        <Text style={styles.cancelText}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  )
})

AlertDialogCancel.displayName = "AlertDialogCancel"

const styles = StyleSheet.create((theme) => ({
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[4],
  },
  content: {
    width: "100%",
    maxWidth: 480,
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
      size: {
        sm: {
          maxWidth: 360,
        },
        lg: {
          maxWidth: 640,
        },
        fullscreen: {
          maxWidth: "100%",
          width: "100%",
          height: "100%",
          borderRadius: 0,
          padding: theme.spacing[8],
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
  action: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    color: theme.colors.primaryForeground,
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    fontWeight: theme.typography.weights.medium,
  },
  actionPressed: {
    opacity: 0.9,
  },
  actionDisabled: {
    opacity: 0.6,
  },
  cancel: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.input,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    fontWeight: theme.typography.weights.medium,
  },
  cancelPressed: {
    opacity: 0.9,
  },
  cancelDisabled: {
    opacity: 0.6,
  },
}))
