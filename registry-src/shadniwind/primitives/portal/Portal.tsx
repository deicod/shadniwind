import React, { useEffect, useRef } from "react"

import { usePortalStore } from "./PortalProvider.js"

export type PortalProps = {
  name?: string
  children: React.ReactNode
}

let portalKey = 0

export function Portal({ name = "root", children }: PortalProps) {
  const store = usePortalStore()
  const keyRef = useRef<number>(0)

  if (keyRef.current === 0) {
    portalKey += 1
    keyRef.current = portalKey
  }

  useEffect(() => {
    store.mount(name, keyRef.current, children)

    return () => {
      store.unmount(name, keyRef.current)
    }
  }, [store, name])

  useEffect(() => {
    store.update(name, keyRef.current, children)
  }, [store, name, children])

  return null
}
