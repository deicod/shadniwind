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
 * Teleports its children into a `PortalHost` with a matching name.
 * 
 * **Overview:**
 * Use this component to render content outside its current parent view hierarchy. 
 * This is essential for components that must overflow their containers, such 
 * as Modals, Dropdowns, and Tooltips, especially on Native where `overflow: visible` 
 * behaves differently or is constrained by parent bounds.
 *
 * **Lifecycle:**
 * When mounted, it registers its content with the nearest `PortalProvider`'s store.
 * When unmounted, it automatically cleans up its entry from the store.
 *
 * @example
 * <Portal name="root">
 *   <View style={{ backgroundColor: 'white', padding: 20 }}>
 *     <Text>I am rendered at the root level!</Text>
 *   </View>
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
