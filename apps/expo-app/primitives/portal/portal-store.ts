import type { ReactNode } from "react"

/**
 * Represents a node being rendered in a portal.
 */
export type PortalNode = {
  /** Unique key for the portal entry, usually sequential. */
  key: number
  /** The React content to be rendered. */
  node: ReactNode
}

/**
 * A central store that manages the state of all portals in the application.
 * It uses a Map of Maps to track content for multiple named PortalHosts.
 *
 * This store follows the `useSyncExternalStore` contract for efficient React updates.
 */
export class PortalStore {
  /** Map of host names to a Map of entry keys to React nodes. */
  private hosts = new Map<string, Map<number, ReactNode>>()
  /** Set of listeners to be notified when the store changes. */
  private listeners = new Set<() => void>()

  /**
   * Subscribes to store changes.
   * @param listener - Callback function invoked on any change.
   * @returns An unsubscribe function.
   */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Gets a snapshot of all nodes currently mounted in a specific host.
   * @param name - The name of the PortalHost.
   * @returns An array of PortalNodes for the given host.
   */
  getSnapshot(name: string): PortalNode[] {
    const host = this.hosts.get(name)
    if (!host) {
      return []
    }

    return Array.from(host.entries()).map(([key, node]) => ({ key, node }))
  }

  /**
   * Mounts a new node into a specific host.
   * @param name - The target PortalHost name.
   * @param key - The unique key for this portal entry.
   * @param node - The content to render.
   */
  mount(name: string, key: number, node: ReactNode): void {
    const host = this.ensureHost(name)
    const hadEntry = host.has(key)
    const prev = host.get(key)
    host.set(key, node)

    // Only notify if something actually changed (new entry or content update)
    if (!hadEntry || prev !== node) {
      this.notify()
    }
  }

  /**
   * Updates an existing portal entry's content.
   * @param name - The target PortalHost name.
   * @param key - The unique key for this portal entry.
   * @param node - The new content to render.
   */
  update(name: string, key: number, node: ReactNode): void {
    const host = this.ensureHost(name)
    const prev = host.get(key)

    if (prev !== node) {
      host.set(key, node)
      this.notify()
    }
  }

  /**
   * Unmounts a portal entry from a specific host.
   * If the host becomes empty, it is removed from the store.
   * @param name - The target PortalHost name.
   * @param key - The unique key for this portal entry.
   */
  unmount(name: string, key: number): void {
    const host = this.hosts.get(name)
    if (!host) {
      return
    }

    const removed = host.delete(key)
    if (host.size === 0) {
      this.hosts.delete(name)
    }

    if (removed) {
      this.notify()
    }
  }

  /**
   * Ensures a host map exists for the given name.
   * @private
   */
  private ensureHost(name: string): Map<number, ReactNode> {
    const existing = this.hosts.get(name)
    if (existing) {
      return existing
    }

    const created = new Map<number, ReactNode>()
    this.hosts.set(name, created)
    return created
  }

  /**
   * Notifies all subscribers of a state change.
   * @private
   */
  private notify(): void {
    if (this.listeners.size === 0) {
      return
    }

    for (const listener of Array.from(this.listeners)) {
      listener()
    }
  }
}
