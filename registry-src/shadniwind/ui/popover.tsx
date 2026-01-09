import * as React from "react"
import {
  Pressable,
  type PressableProps,
  View,
  type ViewProps,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"
import { FocusScope } from "../primitives/focus/index.js"
import { DismissLayer } from "../primitives/overlay/index.js"
import { Portal } from "../primitives/portal/index.js"
import {
  type Placement,
  usePositioning,
} from "../primitives/positioning/index.js"

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

type PopoverContextValue = {
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerRef: React.RefObject<View | null>
  contentRef: React.RefObject<View | null>
  modal?: boolean
}

const PopoverContext = React.createContext<PopoverContextValue | undefined>(
  undefined,
)

function usePopover() {
  const context = React.useContext(PopoverContext)
  if (!context) {
    throw new Error("usePopover must be used within a Popover")
  }
  return context
}

export type PopoverProps = {
  children: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
}

export function Popover({
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  modal = true,
}: PopoverProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const triggerRef = React.useRef<View>(null)
  const contentRef = React.useRef<View>(null)

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
    <PopoverContext.Provider
      value={{
        open: !!isOpen,
        onOpenChange: handleOpenChange,
        triggerRef,
        contentRef,
        modal,
      }}
    >
      {children}
    </PopoverContext.Provider>
  )
}

export const PopoverTrigger = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  PressableProps & { asChild?: boolean }
>(({ children, asChild, onPress, disabled, ...props }, ref) => {
  const { open, onOpenChange, triggerRef } = usePopover()
  const isDisabled = !!disabled

  const handlePress = React.useCallback(
    (e: unknown) => {
      if (isDisabled) return
      onOpenChange(!open)
      // @ts-expect-error - React Native event type
      onPress?.(e)
    },
    [isDisabled, open, onOpenChange, onPress],
  )

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
    const child = children as React.ReactElement<{
      onPress?: (event: unknown) => void
    }>
    const childOnPress = isDisabled ? undefined : child.props.onPress
    // biome-ignore lint/suspicious/noExplicitAny: Cloning logic
    return React.cloneElement(child as React.ReactElement<any>, {
      ref: triggerRef,
      onPress: composeEventHandlers(childOnPress, handlePress),
      disabled,
      ...props,
    })
  }

  return (
    <Pressable
      ref={triggerRef}
      disabled={disabled}
      onPress={handlePress}
      {...props}
    >
      {children}
    </Pressable>
  )
})

PopoverTrigger.displayName = "PopoverTrigger"

export type PopoverContentProps = ViewProps & {
  side?: Placement
  sideOffset?: number
  align?: "start" | "center" | "end"
  alignOffset?: number
  avoidCollisions?: boolean
}

const styles = StyleSheet.create((theme) => ({
  content: {
    zIndex: 50,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.popover,
    padding: 12, // p-4 equivalent
    shadowColor: theme.colors.foreground, // shadow-md
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
}))

export const PopoverContent = React.forwardRef<View, PopoverContentProps>(
  (
    {
      children,
      side = "bottom",
      sideOffset = 4,
      align = "center",
      alignOffset = 0,
      avoidCollisions = true,
      style,
      ...props
    },
    ref,
  ) => {
    const { open, onOpenChange, triggerRef, contentRef, modal } = usePopover()

    // Positioning
    const actualPlacement = align === "center" ? side : `${side}-${align}`

    const { position, isPositioned } = usePositioning({
      anchorRef: triggerRef,
      contentRef: contentRef,
      placement: actualPlacement as Placement,
      offset: sideOffset,
      alignOffset,
      flip: avoidCollisions,
      open,
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

    return (
      <Portal>
        <DismissLayer
          onDismiss={() => onOpenChange(false)}
          scrim={modal} // If modal is true, we show backdrop to catch clicks
          scrimStyle={{ backgroundColor: "transparent" }}
        >
          <FocusScope trapped={modal} loop={true}>
            <View
              ref={contentRef}
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
            </View>
          </FocusScope>
        </DismissLayer>
      </Portal>
    )
  },
)

PopoverContent.displayName = "PopoverContent"
