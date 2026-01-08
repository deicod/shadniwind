import React, { createContext, useContext, useRef } from "react"

import { PortalStore } from "./portal-store.js"

const PortalStoreContext = createContext<PortalStore | null>(null)

export type PortalProviderProps = {
  children: React.ReactNode
}

export function PortalProvider({ children }: PortalProviderProps) {
  const storeRef = useRef<PortalStore | null>(null)

  if (!storeRef.current) {
    storeRef.current = new PortalStore()
  }

  return <PortalStoreContext.Provider value={storeRef.current}>{children}</PortalStoreContext.Provider>
}

export function usePortalStore(): PortalStore {
  const store = useContext(PortalStoreContext)

  if (!store) {
    throw new Error("PortalProvider is missing. Wrap your app with <PortalProvider>.")
  }

  return store
}
