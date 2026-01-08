import assert from "node:assert/strict"
import { test } from "node:test"

import { resolveDismissLayerState } from "../registry-src/shadniwind/primitives/overlay/dismiss-layer-state.js"

test("resolveDismissLayerState defaults to non-dismissable without scrim", () => {
  const state = resolveDismissLayerState({})

  assert.deepStrictEqual(state, {
    isDismissable: false,
    shouldCapture: false,
    backdropPointerEvents: "none",
  })
})

test("resolveDismissLayerState captures input when scrim is enabled", () => {
  const state = resolveDismissLayerState({ scrim: true })

  assert.deepStrictEqual(state, {
    isDismissable: false,
    shouldCapture: true,
    backdropPointerEvents: "auto",
  })
})

test("resolveDismissLayerState infers dismissable from onDismiss", () => {
  const state = resolveDismissLayerState({ onDismiss: () => {} })

  assert.deepStrictEqual(state, {
    isDismissable: true,
    shouldCapture: true,
    backdropPointerEvents: "auto",
  })
})

test("resolveDismissLayerState respects explicit dismissable false", () => {
  const state = resolveDismissLayerState({
    dismissable: false,
    onDismiss: () => {},
  })

  assert.deepStrictEqual(state, {
    isDismissable: false,
    shouldCapture: false,
    backdropPointerEvents: "none",
  })
})

test("resolveDismissLayerState respects scrim pointer event overrides", () => {
  const state = resolveDismissLayerState({
    scrim: true,
    scrimPointerEvents: "box-none",
  })

  assert.deepStrictEqual(state, {
    isDismissable: false,
    shouldCapture: true,
    backdropPointerEvents: "box-none",
  })
})
