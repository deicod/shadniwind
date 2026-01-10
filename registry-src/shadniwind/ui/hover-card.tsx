import * as React from "react"
import {
  Platform,
  Pressable,
  type PressableProps,
  type View,
  type ViewProps,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"
import { DismissLayer } from "../primitives/overlay/index.js"
import { Portal } from "../primitives/portal/index.js"
import {
  type Placement,
  usePositioning,
} from "../primitives/positioning/index.js"

const HOVER_CARD_OPEN_DELAY = 700
const HOVER_CARD_CLOSE_DELAY = 300

function composeEventHandlers<E>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {},
) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event)

    if (
      checkForDefaultPrevented === false ||
      // @ts-expect-error - defaultPrevented check
      !event?.defaultPrevented
    ) {
      return ourEventHandler?.(event)
    }
  }
}

type HoverCardContextValue = {
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerRef: React.RefObject<View | null>
  contentRef: React.RefObject<View | null>
  scheduleOpen: () => void
  scheduleClose: () => void
  clearTimers: () => void
  openDelay: number
  closeDelay: number
}

const HoverCardContext = React.createContext<HoverCardContextValue | undefined>(
  undefined,
)

function useHoverCard() {
  const context = React.useContext(HoverCardContext)
  if (!context) {
    throw new Error("HoverCard components must be used within HoverCard")
  }
  return context
}

export type HoverCardProps = {
  children: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  openDelay?: number
  closeDelay?: number
}

export function HoverCard({
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  openDelay = HOVER_CARD_OPEN_DELAY,
  closeDelay = HOVER_CARD_CLOSE_DELAY,
}: HoverCardProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const triggerRef = React.useRef<View>(null)
  const contentRef = React.useRef<View>(null)
  const openTimerRef = React.useRef<NodeJS.Timeout | undefined>(undefined)
  const closeTimerRef = React.useRef<NodeJS.Timeout | undefined>(undefined)

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

  const clearTimers = React.useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current)
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
    }
    openTimerRef.current = undefined
    closeTimerRef.current = undefined
  }, [])

  const scheduleOpen = React.useCallback(() => {
    if (isOpen) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
      }
      return
    }

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
    }
    if (openDelay === 0) {
      handleOpenChange(true)
      return
    }
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current)
    }
    openTimerRef.current = setTimeout(() => {
      handleOpenChange(true)
    }, openDelay)
  }, [handleOpenChange, isOpen, openDelay])

  const scheduleClose = React.useCallback(() => {
    if (!isOpen) {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current)
      }
      return
    }

    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current)
    }
    if (closeDelay === 0) {
      handleOpenChange(false)
      return
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
    }
    closeTimerRef.current = setTimeout(() => {
      handleOpenChange(false)
    }, closeDelay)
  }, [closeDelay, handleOpenChange, isOpen])

  React.useEffect(() => {
    return () => clearTimers()
  }, [clearTimers])

  return (
    <HoverCardContext.Provider
      value={{
        open: !!isOpen,
        onOpenChange: handleOpenChange,
        triggerRef,
        contentRef,
        scheduleOpen,
        scheduleClose,
        clearTimers,
        openDelay,
        closeDelay,
      }}
    >
      {children}
    </HoverCardContext.Provider>
  )
}

export type HoverCardTriggerProps = PressableProps & { asChild?: boolean }

export const HoverCardTrigger = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  HoverCardTriggerProps
>(
  (
    {
      children,
      asChild,
      onHoverIn,
      onHoverOut,
      onFocus,
      onBlur,
      onLongPress,
      disabled,
      ...props
    },
    ref,
  ) => {
    const { onOpenChange, triggerRef, scheduleOpen, scheduleClose } =
      useHoverCard()
    const isDisabled = !!disabled

    const handleHoverIn = React.useCallback(
      (event: unknown) => {
        if (isDisabled) return
        if (Platform.OS === "web") {
          scheduleOpen()
        }
        // @ts-expect-error - Web event type
        onHoverIn?.(event)
      },
      [isDisabled, onHoverIn, scheduleOpen],
    )

    const handleHoverOut = React.useCallback(
      (event: unknown) => {
        if (isDisabled) return
        if (Platform.OS === "web") {
          scheduleClose()
        }
        // @ts-expect-error - Web event type
        onHoverOut?.(event)
      },
      [isDisabled, onHoverOut, scheduleClose],
    )

    const handleFocus = React.useCallback(
      (event: unknown) => {
        if (isDisabled) return
        if (Platform.OS === "web") {
          scheduleOpen()
        }
        // @ts-expect-error - Web event type
        onFocus?.(event)
      },
      [isDisabled, onFocus, scheduleOpen],
    )

    const handleBlur = React.useCallback(
      (event: unknown) => {
        if (isDisabled) return
        if (Platform.OS === "web") {
          scheduleClose()
        }
        // @ts-expect-error - Web event type
        onBlur?.(event)
      },
      [isDisabled, onBlur, scheduleClose],
    )

    const handleLongPress = React.useCallback(
      (event: unknown) => {
        if (isDisabled) return
        onOpenChange(true)
        // @ts-expect-error - Event type mismatch
        onLongPress?.(event)
      },
      [isDisabled, onLongPress, onOpenChange],
    )

    const setTriggerRef = React.useCallback(
      (node: View | null) => {
        triggerRef.current = node
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ;(ref as { current: View | null }).current = node
        }
      },
      [ref, triggerRef],
    )

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{
        onHoverIn?: (event: unknown) => void
        onHoverOut?: (event: unknown) => void
        onFocus?: (event: unknown) => void
        onBlur?: (event: unknown) => void
        onLongPress?: (event: unknown) => void
      }>
      const childOnHoverIn = isDisabled ? undefined : child.props.onHoverIn
      const childOnHoverOut = isDisabled ? undefined : child.props.onHoverOut
      const childOnFocus = isDisabled ? undefined : child.props.onFocus
      const childOnBlur = isDisabled ? undefined : child.props.onBlur
      const childOnLongPress = isDisabled ? undefined : child.props.onLongPress
      // biome-ignore lint/suspicious/noExplicitAny: Cloning logic
      return React.cloneElement(child as React.ReactElement<any>, {
        ref: setTriggerRef,
        onHoverIn: composeEventHandlers(childOnHoverIn, handleHoverIn),
        onHoverOut: composeEventHandlers(childOnHoverOut, handleHoverOut),
        onFocus: composeEventHandlers(childOnFocus, handleFocus),
        onBlur: composeEventHandlers(childOnBlur, handleBlur),
        onLongPress: composeEventHandlers(childOnLongPress, handleLongPress),
        disabled: isDisabled,
        ...props,
      })
    }

    return (
      <Pressable
        ref={setTriggerRef}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onLongPress={handleLongPress}
        disabled={disabled}
        {...props}
      >
        {children}
      </Pressable>
    )
  },
)

HoverCardTrigger.displayName = "HoverCardTrigger"

export type HoverCardContentProps = ViewProps & {
  side?: Placement
  sideOffset?: number
  align?: "start" | "center" | "end"
  alignOffset?: number
  avoidCollisions?: boolean
  dismissable?: boolean
  onDismiss?: () => void
  onHoverIn?: (event: unknown) => void
  onHoverOut?: (event: unknown) => void
}

const styles = StyleSheet.create((theme) => ({
  content: {
    zIndex: 50,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.popover,
    padding: theme.spacing[4],
    shadowColor: theme.colors.foreground,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
}))

export const HoverCardContent = React.forwardRef<View, HoverCardContentProps>(
  (
    {
      children,
      side = "top",
      sideOffset = 4,
      align = "center",
      alignOffset = 0,
      avoidCollisions = true,
      dismissable = true,
      onDismiss,
      onHoverIn,
      onHoverOut,
      onFocus,
      onBlur,
      style,
      ...props
    },
    ref,
  ) => {
    const {
      open,
      onOpenChange,
      triggerRef,
      contentRef,
      scheduleOpen,
      scheduleClose,
      clearTimers,
    } = useHoverCard()

    const actualPlacement = align === "center" ? side : `${side}-${align}`

    const { position, isPositioned } = usePositioning({
      anchorRef: triggerRef,
      contentRef,
      placement: actualPlacement as Placement,
      offset: sideOffset,
      alignOffset,
      flip: avoidCollisions,
      open,
    })

    const handleDismiss = React.useCallback(() => {
      clearTimers()
      onOpenChange(false)
      onDismiss?.()
    }, [clearTimers, onDismiss, onOpenChange])

    const handleHoverIn = React.useCallback(
      (event: unknown) => {
        if (Platform.OS === "web") {
          scheduleOpen()
        }
        onHoverIn?.(event)
      },
      [onHoverIn, scheduleOpen],
    )

    const handleHoverOut = React.useCallback(
      (event: unknown) => {
        if (Platform.OS === "web") {
          scheduleClose()
        }
        onHoverOut?.(event)
      },
      [onHoverOut, scheduleClose],
    )

    const handleFocus = React.useCallback(
      (event: unknown) => {
        if (Platform.OS === "web") {
          scheduleOpen()
        }
        // @ts-expect-error - Web event type
        onFocus?.(event)
      },
      [onFocus, scheduleOpen],
    )

    const handleBlur = React.useCallback(
      (event: unknown) => {
        if (Platform.OS === "web") {
          scheduleClose()
        }
        // @ts-expect-error - Web event type
        onBlur?.(event)
      },
      [onBlur, scheduleClose],
    )

    const setContentRef = React.useCallback(
      (node: View | null) => {
        contentRef.current = node
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ;(ref as { current: View | null }).current = node
        }
      },
      [contentRef, ref],
    )

    if (!open) return null

    return (
      <Portal>
        <DismissLayer onDismiss={handleDismiss} dismissable={dismissable}>
          <Pressable
            ref={setContentRef}
            onHoverIn={handleHoverIn}
            onHoverOut={handleHoverOut}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={[
              styles.content,
              {
                position: "absolute",
                opacity: isPositioned ? 1 : 0,
                top: position.top,
                left: position.left,
              },
              style,
            ]}
            {...props}
          >
            {children}
          </Pressable>
        </DismissLayer>
      </Portal>
    )
  },
)

HoverCardContent.displayName = "HoverCardContent"
