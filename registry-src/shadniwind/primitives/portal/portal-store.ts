import type { ReactNode } from "react"

export type PortalNode = {
  key: number
  node: ReactNode
}

export class PortalStore {
  private hosts = new Map<string, Map<number, ReactNode>>()
  private listeners = new Set<() => void>()

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getSnapshot(name: string): PortalNode[] {
    const host = this.hosts.get(name)
    if (!host) {
      return []
    }

    return Array.from(host.entries()).map(([key, node]) => ({ key, node }))
  }

  mount(name: string, key: number, node: ReactNode): void {
    const host = this.ensureHost(name)
    const hadEntry = host.has(key)
    const prev = host.get(key)
    host.set(key, node)

    if (!hadEntry || prev !== node) {
      this.notify()
    }
  }

  update(name: string, key: number, node: ReactNode): void {
    const host = this.ensureHost(name)
    const prev = host.get(key)

    if (prev !== node) {
      host.set(key, node)
      this.notify()
    }
  }

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

  private ensureHost(name: string): Map<number, ReactNode> {
    const existing = this.hosts.get(name)
    if (existing) {
      return existing
    }

    const created = new Map<number, ReactNode>()
    this.hosts.set(name, created)
    return created
  }

  private notify(): void {
    if (this.listeners.size === 0) {
      return
    }

    for (const listener of Array.from(this.listeners)) {
      listener()
    }
  }
}
