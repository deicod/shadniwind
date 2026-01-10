import type React from "react"
import { createContext, useContext, useRef } from "react"

import { PortalStore } from "./portal-store.js"

const PortalStoreContext = createContext<PortalStore | null>(null)

export type PortalProviderProps = {
  children: React.ReactNode
}

/**
 * Provides the PortalStore to all Portal and PortalHost components.
 * This should be rendered at the root of your application, preferably
 * in your root layout or App component before any UI that uses portals.
 */
export function PortalProvider({ children }: PortalProviderProps) {
  const storeRef = useRef<PortalStore | null>(null)

  if (!storeRef.current) {
    storeRef.current = new PortalStore()
  }

  return (
    <PortalStoreContext.Provider value={storeRef.current}>
      {children}
    </PortalStoreContext.Provider>
  )
}

/**
 * Hook to access the internal PortalStore.
 * @throws {Error} If used outside of a <PortalProvider>.
 * @returns The singleton PortalStore instance.
 */
export function usePortalStore(): PortalStore {
  const store = useContext(PortalStoreContext)

  if (!store) {
    throw new Error(
      "PortalProvider is missing. Wrap your app with <PortalProvider>.",
    )
  }

  return store
}
