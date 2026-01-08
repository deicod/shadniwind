import * as React from "react"
import { View } from "react-native"
import type { RovingFocusGroupProps, RovingFocusItemProps } from "./types.js"

const ITEM_DATA_ATTR = "data-roving-focus-item"
const VALUE_DATA_ATTR = "data-roving-focus-value"

const RovingFocusContext = React.createContext<{
  value?: string
  onValueChange: (value: string) => void
  orientation?: "horizontal" | "vertical" | "both"
  dir?: "ltr" | "rtl"
  loop?: boolean
} | null>(null)

function getNextItem(
  current: HTMLElement,
  items: HTMLElement[],
  dir: "next" | "prev",
  loop: boolean,
): HTMLElement | null {
  const index = items.indexOf(current)
  if (index === -1) return null

  let nextIndex = dir === "next" ? index + 1 : index - 1

  if (loop) {
    if (nextIndex < 0) nextIndex = items.length - 1
    else if (nextIndex >= items.length) nextIndex = 0
  }

  // Clamp if not looping
  if (nextIndex < 0 || nextIndex >= items.length) return null

  return items[nextIndex]
}

export const RovingFocusGroup = React.forwardRef<View, RovingFocusGroupProps>(
  (
    {
      orientation = "vertical",
      dir = "ltr",
      loop = false,
      value: valueProp,
      defaultValue,
      onValueChange,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = React.useState(valueProp ?? defaultValue)
    const isControlled = valueProp !== undefined
    const currentValue = isControlled ? valueProp : value

    const handleValueChange = React.useCallback(
      (newValue: string) => {
        if (!isControlled) {
          setValue(newValue)
        }
        onValueChange?.(newValue)
      },
      [isControlled, onValueChange],
    )

    const handleKeyDown = (e: React.KeyboardEvent) => {
      const container = e.currentTarget as HTMLElement
      const items = Array.from(
        container.querySelectorAll(
          `[${ITEM_DATA_ATTR}]:not([aria-disabled="true"]):not([disabled])`,
        ),
      ) as HTMLElement[]

      if (items.length === 0) return

      const target = e.target as HTMLElement
      const currentItem = target.closest(`[${ITEM_DATA_ATTR}]`) as HTMLElement

      if (!currentItem) return

      const isRtl = dir === "rtl"
      const isVertical = orientation === "vertical" || orientation === "both"
      const isHorizontal =
        orientation === "horizontal" || orientation === "both"

      let nextItem: HTMLElement | null = null

      if (e.key === "ArrowDown" && isVertical) {
        nextItem = getNextItem(currentItem, items, "next", loop)
      } else if (e.key === "ArrowUp" && isVertical) {
        nextItem = getNextItem(currentItem, items, "prev", loop)
      } else if (e.key === "ArrowRight" && isHorizontal) {
        nextItem = getNextItem(
          currentItem,
          items,
          isRtl ? "prev" : "next",
          loop,
        )
      } else if (e.key === "ArrowLeft" && isHorizontal) {
        nextItem = getNextItem(
          currentItem,
          items,
          isRtl ? "next" : "prev",
          loop,
        )
      } else if (e.key === "Home") {
        nextItem = items[0]
      } else if (e.key === "End") {
        nextItem = items[items.length - 1]
      }

      if (nextItem) {
        e.preventDefault()
        handleValueChange(nextItem.getAttribute(VALUE_DATA_ATTR) || "")
        nextItem.focus()
      }
    }

    const internalRef = React.useRef<HTMLElement | null>(null)
    const setRef = React.useCallback(
      (node: View | null) => {
        internalRef.current = node as unknown as HTMLElement
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ;(ref as { current: View | null }).current = node
        }
      },
      [ref],
    )

    React.useEffect(() => {
      if (currentValue !== undefined) return
      const container = internalRef.current
      if (!container) return

      const items = Array.from(
        container.querySelectorAll(
          `[${ITEM_DATA_ATTR}]:not([aria-disabled="true"]):not([disabled])`,
        ),
      ) as HTMLElement[]

      if (items.length > 0) {
        const firstItemValue = items[0].getAttribute(VALUE_DATA_ATTR)
        if (firstItemValue) {
          handleValueChange(firstItemValue)
        }
      }
    }, [currentValue, handleValueChange])
    // If we run when undefined, it will set it, then re-render with defined value.

    return (
      <RovingFocusContext.Provider
        value={{
          value: currentValue,
          onValueChange: handleValueChange,
          orientation,
          dir,
          loop,
        }}
      >
        {/* @ts-expect-error: web-only prop */}
        <View ref={setRef} onKeyDown={handleKeyDown} style={style} {...props}>
          {children}
        </View>
      </RovingFocusContext.Provider>
    )
  },
)

RovingFocusGroup.displayName = "RovingFocusGroup"

export const RovingFocusItem = React.forwardRef<View, RovingFocusItemProps>(
  ({ value, disabled, children, ...props }, ref) => {
    const context = React.useContext(RovingFocusContext)
    const isSelected = context?.value === value
    // tabindex is 0 if selected (or no selection and first?), -1 otherwise
    // Simpler: 0 if selected. If nothing selected, maybe first one?
    // Usually Roving Focus ensures one item is always tabbable.
    // If context.value is undefined, make the first one tabbable?
    // For now, let's assume uncontrolled defaultValue is set or controlled value is set.
    // If nothing set, user tabs in -> we might not catch focus.
    // robust impl checks if any item is active.

    const tabIndex = isSelected ? 0 : -1

    return (
      <View
        ref={ref}
        {...{ [ITEM_DATA_ATTR]: true, [VALUE_DATA_ATTR]: value }}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        focusable={!disabled}
        // @ts-expect-error - Web-only prop
        disabled={disabled}
        tabIndex={disabled ? undefined : tabIndex}
        {...props}
      >
        {children}
      </View>
    )
  },
)

RovingFocusItem.displayName = "RovingFocusItem"
