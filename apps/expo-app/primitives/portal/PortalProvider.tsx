import type React from "react"
import { createContext, useContext, useRef } from "react"

import { PortalStore } from "./portal-store"

const PortalStoreContext = createContext<PortalStore | null>(null)

export type PortalProviderProps = {
  /**
   * The application components that will have access to the portal system.
   */
  children: React.ReactNode
}

/**
 * Provides the `PortalStore` context to all `Portal` and `PortalHost` components.
 * 
 * **Placement Guidance:**
 * This should be rendered at the root of your application, typically in your 
 * root layout (e.g., `app/_layout.tsx` in Expo Router). Only one `PortalProvider`
 * should exist in the component tree.
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
