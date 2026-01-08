import assert from "node:assert/strict"
import { test } from "node:test"

import { PortalStore } from "../registry-src/shadniwind/primitives/portal/portal-store.js"

test("PortalStore mounts nodes per host and preserves order", () => {
  const store = new PortalStore()

  store.mount("root", 1, "Alpha")
  store.mount("root", 2, "Beta")

  assert.deepStrictEqual(store.getSnapshot("root"), [
    { key: 1, node: "Alpha" },
    { key: 2, node: "Beta" },
  ])
})

test("PortalStore updates nodes without changing order", () => {
  const store = new PortalStore()

  store.mount("root", 1, "Alpha")
  store.mount("root", 2, "Beta")
  store.update("root", 1, "Alpha+")

  assert.deepStrictEqual(store.getSnapshot("root"), [
    { key: 1, node: "Alpha+" },
    { key: 2, node: "Beta" },
  ])
})

test("PortalStore isolates hosts", () => {
  const store = new PortalStore()

  store.mount("root", 1, "Alpha")
  store.mount("modal", 2, "Omega")

  assert.deepStrictEqual(store.getSnapshot("root"), [{ key: 1, node: "Alpha" }])
  assert.deepStrictEqual(store.getSnapshot("modal"), [{ key: 2, node: "Omega" }])
})

test("PortalStore notifies subscribers on changes only", () => {
  const store = new PortalStore()
  let calls = 0
  const unsubscribe = store.subscribe(() => {
    calls += 1
  })

  store.mount("root", 1, "Alpha")
  store.update("root", 1, "Alpha")
  store.update("root", 1, "Alpha+")
  store.unmount("root", 1)
  unsubscribe()
  store.mount("root", 2, "Beta")

  assert.strictEqual(calls, 3)
})
