import type React from "react"
import { useEffect, useRef } from "react"

import { usePortalStore } from "./PortalProvider"

export type PortalProps = {
  /**
   * The name of the PortalHost where this content should be rendered.
   * Must match the `name` prop of a mounted <PortalHost>.
   * @default "root"
   */
  name?: string
  /**
   * The content to be rendered in the portal.
   */
  children: React.ReactNode
}

let portalKey = 0

/**
 * Renders its children into a `PortalHost` with a matching name.
 * Use this to render content outside the current view hierarchy (e.g., for Modals, Tooltips).
 *
 * @example
 * <Portal name="root">
 *   <View>I am floating!</View>
 * </Portal>
 */
export function Portal({ name = "root", children }: PortalProps) {
  const store = usePortalStore()
  const keyRef = useRef<number>(0)
  const childrenRef = useRef(children)
  childrenRef.current = children

  if (keyRef.current === 0) {
    portalKey += 1
    keyRef.current = portalKey
  }

  useEffect(() => {
    store.mount(name, keyRef.current, childrenRef.current)

    return () => {
      store.unmount(name, keyRef.current)
    }
  }, [store, name])

  useEffect(() => {
    store.update(name, keyRef.current, children)
  }, [store, name, children])

  return null
}
