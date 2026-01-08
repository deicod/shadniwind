import * as React from "react"
import { View } from "react-native"
import type { FocusScopeProps } from "./types.js"

const AUTOFOCUS_ON_MOUNT = "focusScope.autoFocusOnMount"
const AUTOFOCUS_ON_UNMOUNT = "focusScope.autoFocusOnUnmount"

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([hidden]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = Array.from(
    container.querySelectorAll(FOCUSABLE_SELECTOR),
  ) as HTMLElement[]
  return elements.filter((el) => el.offsetParent !== null)
}

export const FocusScope = React.forwardRef<View, FocusScopeProps>(
  (
    {
      loop = false,
      trapped = false,
      onMountAutoFocus,
      onUnmountAutoFocus,
      ...props
    },
    ref,
  ) => {
    const containerRef = React.useRef<HTMLElement | null>(null)
    const lastFocusedElementRef = React.useRef<HTMLElement | null>(null)

    const setRef = React.useCallback(
      (node: View | null) => {
        containerRef.current = node as unknown as HTMLElement
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ;(ref as { current: View | null }).current = node
        }
      },
      [ref],
    )

    // Record the previously focused element when trapping activates
    React.useEffect(() => {
      if (trapped) {
        lastFocusedElementRef.current = document.activeElement as HTMLElement
      }
    }, [trapped])

    // Mount Auto Focus
    React.useEffect(() => {
      if (!trapped) return

      const container = containerRef.current
      if (!container) return

      // Use a strict-ish Event equivalent for Web
      const evt = new Event(AUTOFOCUS_ON_MOUNT, { cancelable: true })
      onMountAutoFocus?.(evt)

      if (!evt.defaultPrevented) {
        const elements = getFocusableElements(container)
        if (elements.length > 0) {
          elements[0].focus()
        }
      }
    }, [trapped, onMountAutoFocus])

    // Unmount Auto Focus (Restore)
    React.useEffect(() => {
      return () => {
        if (!trapped) return

        const evt = new Event(AUTOFOCUS_ON_UNMOUNT, { cancelable: true })
        onUnmountAutoFocus?.(evt)

        if (!evt.defaultPrevented) {
          lastFocusedElementRef.current?.focus()
        }
      }
    }, [trapped, onUnmountAutoFocus])

    // Trap logic (keydown)
    React.useEffect(() => {
      if (!trapped) return

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return

        const container = containerRef.current
        if (!container) return

        const elements = getFocusableElements(container)
        if (elements.length === 0) {
          e.preventDefault()
          return
        }

        const first = elements[0]
        const last = elements[elements.length - 1]
        const active = document.activeElement as HTMLElement

        if (e.shiftKey) {
          if (active === first) {
            e.preventDefault()
            if (loop) last.focus()
          }
        } else {
          if (active === last) {
            e.preventDefault()
            if (loop) first.focus()
          }
        }
      }

      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }, [trapped, loop])

    return <View ref={setRef} {...props} />
  },
)

FocusScope.displayName = "FocusScope"
