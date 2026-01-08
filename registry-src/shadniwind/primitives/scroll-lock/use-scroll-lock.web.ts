import * as React from "react"

export function useScrollLock(lock: boolean) {
  React.useEffect(() => {
    if (!lock) return

    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [lock])
}
