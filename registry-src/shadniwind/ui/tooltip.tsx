import * as React from "react"
import {
  Platform,
  Pressable,
  type PressableProps,
  Text,
  View,
  type ViewProps,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"
import { Portal } from "../primitives/portal/index.js"
import {
  type Placement,
  usePositioning,
} from "../primitives/positioning/index.js"

const TOOLTIP_OPEN_DELAY = 700

type TooltipContextValue = {
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerRef: React.RefObject<View | null>
  contentRef: React.RefObject<View | null>
  contentId: string
  delayDuration: number
}

const TooltipContext = React.createContext<TooltipContextValue | undefined>(
  undefined,
)

function useTooltip() {
  const context = React.useContext(TooltipContext)
  if (!context) {
    throw new Error("useTooltip must be used within a Tooltip")
  }
  return context
}

export type TooltipProps = {
  children: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  delayDuration?: number
}

export function Tooltip({
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  delayDuration = TOOLTIP_OPEN_DELAY,
}: TooltipProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const triggerRef = React.useRef<View>(null)
  const contentRef = React.useRef<View>(null)
  const contentId = React.useId()

  const isControlled = openProp !== undefined
  const isOpen = isControlled ? openProp : open

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    },
    [isControlled, onOpenChange],
  )

  return (
    <TooltipContext.Provider
      value={{
        open: !!isOpen,
        onOpenChange: handleOpenChange,
        triggerRef,
        contentRef,
        contentId,
        delayDuration,
      }}
    >
      {children}
    </TooltipContext.Provider>
  )
}

export const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  PressableProps & { asChild?: boolean }
>(
  (
    {
      children,
      asChild,
      onPress,
      onLongPress,
      onPressIn,
      onPressOut,
      onHoverIn,
      onHoverOut,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const { onOpenChange, triggerRef, delayDuration } = useTooltip()
    const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined)

    const handleOpen = React.useCallback(() => {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        onOpenChange(true)
      }, delayDuration)
    }, [delayDuration, onOpenChange])

    const handleClose = React.useCallback(() => {
      clearTimeout(timeoutRef.current)
      onOpenChange(false)
    }, [onOpenChange])

    // Web: Hover and Focus
    const handleHoverIn = React.useCallback(
      (e: unknown) => {
        if (Platform.OS === "web") {
          handleOpen()
        }
        // @ts-expect-error - Web event type
        onHoverIn?.(e)
      },
      [handleOpen, onHoverIn],
    )

    const handleHoverOut = React.useCallback(
      (e: unknown) => {
        if (Platform.OS === "web") {
          handleClose()
        }
        // @ts-expect-error - Web event type
        onHoverOut?.(e)
      },
      [handleClose, onHoverOut],
    )

    const handleFocus = React.useCallback(
      (e: unknown) => {
        if (Platform.OS === "web") {
          handleOpen()
        }
        // @ts-expect-error - Web event type
        onFocus?.(e)
      },
      [handleOpen, onFocus],
    )

    const handleBlur = React.useCallback(
      (e: unknown) => {
        if (Platform.OS === "web") {
          handleClose()
        }
        // @ts-expect-error - Web event type
        onBlur?.(e)
      },
      [handleClose, onBlur],
    )

    // Native: Long Press usually triggers tooltip, or press
    // Native: Long Press usually triggers tooltip, or press
    const handleLongPress = React.useCallback(
      (e: unknown) => {
        onOpenChange(true)
        // @ts-expect-error - Event type mismatch
        onLongPress?.(e)
      },
      [onOpenChange, onLongPress],
    )

    // Clean up timeout
    React.useEffect(() => {
      return () => clearTimeout(timeoutRef.current)
    }, [])

    // Sync ref
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
      // If asChild, we clone the child and add props.
      // This is complex in RN if child is functional component without ref fwd.
      // We will assume child accepts these props.

      // We need to merge refs... simplified here: assume triggerRef is passed to cloning
      // biome-ignore lint/suspicious/noExplicitAny: Cloning logic
      return React.cloneElement(children as React.ReactElement<any>, {
        ref: triggerRef,
        onHoverIn: handleHoverIn,
        onHoverOut: handleHoverOut,
        onFocus: handleFocus,
        onBlur: handleBlur,
        onLongPress: handleLongPress,
        ...props, // merge other props
      })
    }

    return (
      <Pressable
        ref={triggerRef}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onLongPress={handleLongPress}
        {...props}
      >
        {children}
      </Pressable>
    )
  },
)

TooltipTrigger.displayName = "TooltipTrigger"

export type TooltipContentProps = ViewProps & {
  side?: Placement
  sideOffset?: number
  align?: "start" | "center" | "end"
  alignOffset?: number
  avoidCollisions?: boolean
}

const styles = StyleSheet.create((theme) => ({
  content: {
    zIndex: 50,
    overflow: "hidden",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.popover,
    paddingHorizontal: 12, // px-3
    paddingVertical: 6, // py-1.5
    shadowColor: theme.colors.foreground, // shadow-md equiv?
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.popoverForeground,
  },
}))

export const TooltipContent = React.forwardRef<View, TooltipContentProps>(
  (
    {
      children,
      side = "top",
      sideOffset = 4,
      align = "center",
      alignOffset = 0,
      avoidCollisions = true,
      style,
      ...props
    },
    ref,
  ) => {
    const { open, triggerRef, contentRef } = useTooltip()

    // Use positioning hook
    const { position, isPositioned } = usePositioning({
      anchorRef: triggerRef,
      contentRef: contentRef,
      placement: side,
      offset: sideOffset,
      alignOffset,
      flip: avoidCollisions,
      open, // only measure when open
    })

    // Sync ref
    React.useEffect(() => {
      if (ref) {
        if (typeof ref === "function") {
          ref(contentRef.current)
        } else {
          ;(ref as { current: View | null }).current = contentRef.current
        }
      }
    }, [ref, contentRef])

    if (!open) return null

    // We render inside a Portal
    return (
      <Portal>
        <View
          ref={contentRef}
          style={[
            styles.content,
            {
              position: "absolute",
              opacity: isPositioned ? 1 : 0, // Hide until positioned
              top: position.top,
              left: position.left,
              // width? max-width?
            },
            style,
          ]}
          {...props}
        >
          {/* Wrap children in Text if they are strings, primitive style */}
          {typeof children === "string" ? (
            <Text style={styles.text}>{children}</Text>
          ) : (
            children
          )}
        </View>
      </Portal>
    )
  },
)

TooltipContent.displayName = "TooltipContent"
