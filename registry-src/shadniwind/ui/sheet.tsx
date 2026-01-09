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

type SheetContextValue = {
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerRef: React.RefObject<View | null>
  contentRef: React.RefObject<View | null>
  titleId: string
  descriptionId: string
  modal: boolean
}

const SheetContext = React.createContext<SheetContextValue | undefined>(
  undefined,
)

function useSheet() {
  const context = React.useContext(SheetContext)
  if (!context) {
    throw new Error("Sheet components must be used within a Sheet")
  }
  return context
}

export type SheetProps = {
  children: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
}

export function Sheet({
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  modal = true,
}: SheetProps) {
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
    <SheetContext.Provider
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
    </SheetContext.Provider>
  )
}

export type SheetTriggerProps = PressableProps & { asChild?: boolean }

export const SheetTrigger = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  SheetTriggerProps
>(({ children, asChild, onPress, disabled, ...props }, ref) => {
  const { open, onOpenChange, triggerRef } = useSheet()
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

SheetTrigger.displayName = "SheetTrigger"

export type SheetCloseProps = PressableProps & { asChild?: boolean }

export const SheetClose = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  SheetCloseProps
>(({ children, asChild, onPress, disabled, ...props }, ref) => {
  const { onOpenChange } = useSheet()
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

SheetClose.displayName = "SheetClose"

export type SheetSide = "right" | "left" | "bottom" | "top"

export type SheetContentProps = ViewProps & {
  side?: SheetSide
  overlayStyle?: StyleProp<ViewStyle>
  dismissable?: boolean
  onDismiss?: () => void
}

export const SheetContent = React.forwardRef<View, SheetContentProps>(
  (
    {
      children,
      style,
      overlayStyle,
      side = "right",
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
    } = useSheet()

    useScrollLock(open && modal)
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
          <FocusScope trapped={modal} loop={true} style={styles.container}>
            <View
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

SheetContent.displayName = "SheetContent"

export type SheetHeaderProps = ViewProps & {
  style?: StyleProp<ViewStyle>
}

export const SheetHeader = React.forwardRef<View, SheetHeaderProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.header, style]} {...props} />
  },
)

SheetHeader.displayName = "SheetHeader"

export type SheetFooterProps = ViewProps & {
  style?: StyleProp<ViewStyle>
}

export const SheetFooter = React.forwardRef<View, SheetFooterProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.footer, style]} {...props} />
  },
)

SheetFooter.displayName = "SheetFooter"

export type SheetTitleProps = TextProps & {
  style?: StyleProp<TextStyle>
}

export const SheetTitle = React.forwardRef<Text, SheetTitleProps>(
  ({ style, ...props }, ref) => {
    const { titleId } = useSheet()
    return (
      <Text ref={ref} nativeID={titleId} style={[styles.title, style]} {...props} />
    )
  },
)

SheetTitle.displayName = "SheetTitle"

export type SheetDescriptionProps = TextProps & {
  style?: StyleProp<TextStyle>
}

export const SheetDescription = React.forwardRef<Text, SheetDescriptionProps>(
  ({ style, ...props }, ref) => {
    const { descriptionId } = useSheet()
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

SheetDescription.displayName = "SheetDescription"

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
