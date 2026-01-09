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

type DialogContextValue = {
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerRef: React.RefObject<View | null>
  contentRef: React.RefObject<View | null>
  titleId: string
  descriptionId: string
  modal: boolean
}

const DialogContext = React.createContext<DialogContextValue | undefined>(
  undefined,
)

function useDialog() {
  const context = React.useContext(DialogContext)
  if (!context) {
    throw new Error("Dialog components must be used within a Dialog")
  }
  return context
}

export type DialogProps = {
  children: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
}

export function Dialog({
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  modal = true,
}: DialogProps) {
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
    <DialogContext.Provider
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
    </DialogContext.Provider>
  )
}

export type DialogTriggerProps = PressableProps & { asChild?: boolean }

export const DialogTrigger = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  DialogTriggerProps
>(({ children, asChild, onPress, ...props }, ref) => {
  const { open, onOpenChange, triggerRef } = useDialog()

  const handlePress = React.useCallback(
    (event: unknown) => {
      onOpenChange(!open)
      // @ts-expect-error - React Native event type
      onPress?.(event)
    },
    [open, onOpenChange, onPress],
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
    // biome-ignore lint/suspicious/noExplicitAny: Cloning logic
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: triggerRef,
      onPress: composeEventHandlers(
        // @ts-expect-error - onPress check
        children.props.onPress,
        handlePress,
      ),
      role: Platform.OS === "web" ? "button" : undefined,
      "aria-expanded": Platform.OS === "web" ? open : undefined,
      "aria-haspopup": Platform.OS === "web" ? "dialog" : undefined,
      accessibilityRole: "button",
      accessibilityState: {
        expanded: open,
        disabled: props.disabled,
      },
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
        disabled: props.disabled,
      }}
      onPress={handlePress}
      {...props}
    >
      {children}
    </Pressable>
  )
})

DialogTrigger.displayName = "DialogTrigger"

export type DialogCloseProps = PressableProps & { asChild?: boolean }

export const DialogClose = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  DialogCloseProps
>(({ children, asChild, onPress, ...props }, ref) => {
  const { onOpenChange } = useDialog()

  const handlePress = React.useCallback(
    (event: unknown) => {
      onOpenChange(false)
      // @ts-expect-error - React Native event type
      onPress?.(event)
    },
    [onOpenChange, onPress],
  )

  if (asChild && React.isValidElement(children)) {
    // biome-ignore lint/suspicious/noExplicitAny: Cloning logic
    return React.cloneElement(children as React.ReactElement<any>, {
      ref,
      onPress: composeEventHandlers(
        // @ts-expect-error - onPress check
        children.props.onPress,
        handlePress,
      ),
      accessibilityRole: "button",
      ...props,
    })
  }

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      onPress={handlePress}
      {...props}
    >
      {children}
    </Pressable>
  )
})

DialogClose.displayName = "DialogClose"

export type DialogContentSize = "default" | "sm" | "lg" | "fullscreen"

export type DialogContentProps = ViewProps & {
  size?: DialogContentSize
  overlayStyle?: StyleProp<ViewStyle>
  dismissable?: boolean
  onDismiss?: () => void
}

export const DialogContent = React.forwardRef<View, DialogContentProps>(
  (
    {
      children,
      style,
      overlayStyle,
      size = "default",
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
    } = useDialog()

    useScrollLock(open && modal)
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
      [ref],
    )

    if (!open) return null

    const isDismissable = dismissable ?? modal

    return (
      <Portal>
        <DismissLayer
          onDismiss={handleDismiss}
          dismissable={isDismissable}
          scrim={modal}
          scrimStyle={[styles.overlay, overlayStyle]}
        >
          <FocusScope trapped={modal} loop={true} style={styles.center}>
            <View
              ref={setContentRef}
              role={Platform.OS === "web" ? "dialog" : undefined}
              aria-modal={Platform.OS === "web" ? modal : undefined}
              aria-labelledby={Platform.OS === "web" ? titleId : undefined}
              aria-describedby={Platform.OS === "web" ? descriptionId : undefined}
              accessibilityRole={Platform.OS === "web" ? "dialog" : undefined}
              accessibilityViewIsModal={modal}
              style={[styles.content, variantStyles, style]}
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

DialogContent.displayName = "DialogContent"

export type DialogHeaderProps = ViewProps & {
  style?: StyleProp<ViewStyle>
}

export const DialogHeader = React.forwardRef<View, DialogHeaderProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.header, style]} {...props} />
  },
)

DialogHeader.displayName = "DialogHeader"

export type DialogFooterProps = ViewProps & {
  style?: StyleProp<ViewStyle>
}

export const DialogFooter = React.forwardRef<View, DialogFooterProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.footer, style]} {...props} />
  },
)

DialogFooter.displayName = "DialogFooter"

export type DialogTitleProps = TextProps & {
  style?: StyleProp<TextStyle>
}

export const DialogTitle = React.forwardRef<Text, DialogTitleProps>(
  ({ style, ...props }, ref) => {
    const { titleId } = useDialog()
    return (
      <Text ref={ref} nativeID={titleId} style={[styles.title, style]} {...props} />
    )
  },
)

DialogTitle.displayName = "DialogTitle"

export type DialogDescriptionProps = TextProps & {
  style?: StyleProp<TextStyle>
}

export const DialogDescription = React.forwardRef<Text, DialogDescriptionProps>(
  ({ style, ...props }, ref) => {
    const { descriptionId } = useDialog()
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

DialogDescription.displayName = "DialogDescription"

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
}))
