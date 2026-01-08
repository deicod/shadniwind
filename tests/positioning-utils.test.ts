import assert from "node:assert/strict"
import { test } from "node:test"

import {
  applyFlip,
  composePlacement,
  computePosition,
  constrainToViewport,
  detectOverflow,
  getOppositeSide,
  parsePlacement,
} from "../registry-src/shadniwind/primitives/positioning/positioning-utils.js"
import type { Rect, Viewport } from "../registry-src/shadniwind/primitives/positioning/types.js"

test("parsePlacement extracts side and alignment from placement strings", () => {
  assert.deepStrictEqual(parsePlacement("top"), { side: "top", alignment: "center" })
  assert.deepStrictEqual(parsePlacement("bottom"), { side: "bottom", alignment: "center" })
  assert.deepStrictEqual(parsePlacement("left"), { side: "left", alignment: "center" })
  assert.deepStrictEqual(parsePlacement("right"), { side: "right", alignment: "center" })
  assert.deepStrictEqual(parsePlacement("top-start"), { side: "top", alignment: "start" })
  assert.deepStrictEqual(parsePlacement("top-end"), { side: "top", alignment: "end" })
  assert.deepStrictEqual(parsePlacement("bottom-start"), { side: "bottom", alignment: "start" })
  assert.deepStrictEqual(parsePlacement("bottom-end"), { side: "bottom", alignment: "end" })
  assert.deepStrictEqual(parsePlacement("left-start"), { side: "left", alignment: "start" })
  assert.deepStrictEqual(parsePlacement("left-end"), { side: "left", alignment: "end" })
  assert.deepStrictEqual(parsePlacement("right-start"), { side: "right", alignment: "start" })
  assert.deepStrictEqual(parsePlacement("right-end"), { side: "right", alignment: "end" })
})

test("getOppositeSide returns the opposite side", () => {
  assert.strictEqual(getOppositeSide("top"), "bottom")
  assert.strictEqual(getOppositeSide("bottom"), "top")
  assert.strictEqual(getOppositeSide("left"), "right")
  assert.strictEqual(getOppositeSide("right"), "left")
})

test("composePlacement combines side and alignment", () => {
  assert.strictEqual(composePlacement("top", "center"), "top")
  assert.strictEqual(composePlacement("bottom", "start"), "bottom-start")
  assert.strictEqual(composePlacement("left", "end"), "left-end")
  assert.strictEqual(composePlacement("right", "center"), "right")
})

test("computePosition calculates position for top placement", () => {
  const anchor: Rect = { x: 100, y: 200, width: 80, height: 40 }
  const content: Rect = { x: 0, y: 0, width: 120, height: 60 }
  const offset = 8

  const position = computePosition(anchor, content, "top", offset, 0)

  // top: 200 - 60 - 8 = 132
  // left: 100 + (80 - 120) / 2 = 100 - 20 = 80
  assert.strictEqual(position.top, 132)
  assert.strictEqual(position.left, 80)
})

test("computePosition calculates position for bottom placement", () => {
  const anchor: Rect = { x: 100, y: 200, width: 80, height: 40 }
  const content: Rect = { x: 0, y: 0, width: 120, height: 60 }
  const offset = 8

  const position = computePosition(anchor, content, "bottom", offset, 0)

  // top: 200 + 40 + 8 = 248
  // left: 100 + (80 - 120) / 2 = 80
  assert.strictEqual(position.top, 248)
  assert.strictEqual(position.left, 80)
})

test("computePosition calculates position for left placement", () => {
  const anchor: Rect = { x: 200, y: 100, width: 80, height: 40 }
  const content: Rect = { x: 0, y: 0, width: 60, height: 120 }
  const offset = 8

  const position = computePosition(anchor, content, "left", offset, 0)

  // top: 100 + (40 - 120) / 2 = 60
  // left: 200 - 60 - 8 = 132
  assert.strictEqual(position.top, 60)
  assert.strictEqual(position.left, 132)
})

test("computePosition calculates position for right placement", () => {
  const anchor: Rect = { x: 100, y: 100, width: 80, height: 40 }
  const content: Rect = { x: 0, y: 0, width: 60, height: 120 }
  const offset = 8

  const position = computePosition(anchor, content, "right", offset, 0)

  // top: 100 + (40 - 120) / 2 = 60
  // left: 100 + 80 + 8 = 188
  assert.strictEqual(position.top, 60)
  assert.strictEqual(position.left, 188)
})

test("computePosition handles top-start alignment", () => {
  const anchor: Rect = { x: 100, y: 200, width: 80, height: 40 }
  const content: Rect = { x: 0, y: 0, width: 120, height: 60 }

  const position = computePosition(anchor, content, "top-start", 8, 0)

  // left aligned to anchor left = 100
  assert.strictEqual(position.left, 100)
})

test("computePosition handles top-end alignment", () => {
  const anchor: Rect = { x: 100, y: 200, width: 80, height: 40 }
  const content: Rect = { x: 0, y: 0, width: 120, height: 60 }

  const position = computePosition(anchor, content, "top-end", 8, 0)

  // right aligned: 100 + 80 - 120 = 60
  assert.strictEqual(position.left, 60)
})

test("computePosition applies alignOffset", () => {
  const anchor: Rect = { x: 100, y: 200, width: 80, height: 40 }
  const content: Rect = { x: 0, y: 0, width: 120, height: 60 }

  const position = computePosition(anchor, content, "top-start", 8, 10)

  // left aligned with offset: 100 + 10 = 110
  assert.strictEqual(position.left, 110)
})

test("detectOverflow detects top overflow", () => {
  const viewport: Viewport = { width: 800, height: 600 }
  const content: Rect = { x: 0, y: 0, width: 100, height: 50 }
  const padding = 8

  // Position above viewport
  const overflow = detectOverflow({ top: 5, left: 100 }, content, viewport, padding)
  assert.strictEqual(overflow.top, true)
  assert.strictEqual(overflow.bottom, false)
})

test("detectOverflow detects bottom overflow", () => {
  const viewport: Viewport = { width: 800, height: 600 }
  const content: Rect = { x: 0, y: 0, width: 100, height: 50 }
  const padding = 8

  // Position would extend past viewport bottom
  const overflow = detectOverflow({ top: 560, left: 100 }, content, viewport, padding)
  assert.strictEqual(overflow.top, false)
  assert.strictEqual(overflow.bottom, true) // 560 + 50 = 610 > 600 - 8 = 592
})

test("detectOverflow detects left overflow", () => {
  const viewport: Viewport = { width: 800, height: 600 }
  const content: Rect = { x: 0, y: 0, width: 100, height: 50 }
  const padding = 8

  const overflow = detectOverflow({ top: 100, left: 5 }, content, viewport, padding)
  assert.strictEqual(overflow.left, true)
  assert.strictEqual(overflow.right, false)
})

test("detectOverflow detects right overflow", () => {
  const viewport: Viewport = { width: 800, height: 600 }
  const content: Rect = { x: 0, y: 0, width: 100, height: 50 }
  const padding = 8

  // Position would extend past viewport right
  const overflow = detectOverflow({ top: 100, left: 710 }, content, viewport, padding)
  assert.strictEqual(overflow.left, false)
  assert.strictEqual(overflow.right, true) // 710 + 100 = 810 > 800 - 8 = 792
})

test("applyFlip flips from bottom to top when overflowing", () => {
  const anchor: Rect = { x: 100, y: 550, width: 80, height: 40 }
  const content: Rect = { x: 0, y: 0, width: 100, height: 80 }
  const viewport: Viewport = { width: 800, height: 600 }

  const result = applyFlip(anchor, content, "bottom", 8, 0, viewport, 8)

  // Bottom placement would overflow (550 + 40 + 8 + 80 = 678 > 600)
  // Should flip to top
  assert.strictEqual(result.placement, "top")
  assert.strictEqual(result.flipped, true)
})

test("applyFlip flips from top to bottom when overflowing", () => {
  const anchor: Rect = { x: 100, y: 50, width: 80, height: 40 }
  const content: Rect = { x: 0, y: 0, width: 100, height: 80 }
  const viewport: Viewport = { width: 800, height: 600 }

  const result = applyFlip(anchor, content, "top", 8, 0, viewport, 8)

  // Top placement would overflow (50 - 80 - 8 = -38 < 8)
  // Should flip to bottom
  assert.strictEqual(result.placement, "bottom")
  assert.strictEqual(result.flipped, true)
})

test("applyFlip preserves alignment when flipping", () => {
  const anchor: Rect = { x: 100, y: 50, width: 80, height: 40 }
  const content: Rect = { x: 0, y: 0, width: 100, height: 80 }
  const viewport: Viewport = { width: 800, height: 600 }

  const result = applyFlip(anchor, content, "top-start", 8, 0, viewport, 8)

  // Should flip to bottom-start
  assert.strictEqual(result.placement, "bottom-start")
})

test("applyFlip keeps original placement if no overflow", () => {
  const anchor: Rect = { x: 100, y: 200, width: 80, height: 40 }
  const content: Rect = { x: 0, y: 0, width: 100, height: 80 }
  const viewport: Viewport = { width: 800, height: 600 }

  const result = applyFlip(anchor, content, "bottom", 8, 0, viewport, 8)

  assert.strictEqual(result.placement, "bottom")
  assert.strictEqual(result.flipped, false)
})

test("constrainToViewport clamps position to viewport bounds", () => {
  const content: Rect = { x: 0, y: 0, width: 100, height: 50 }
  const viewport: Viewport = { width: 800, height: 600 }
  const padding = 8

  // Position out of bounds in top-left
  const constrained1 = constrainToViewport({ top: -10, left: -20 }, content, viewport, padding)
  assert.strictEqual(constrained1.top, padding)
  assert.strictEqual(constrained1.left, padding)

  // Position out of bounds in bottom-right
  const constrained2 = constrainToViewport({ top: 580, left: 750 }, content, viewport, padding)
  // Max top: 600 - 50 - 8 = 542, max left: 800 - 100 - 8 = 692
  assert.strictEqual(constrained2.top, 542)
  assert.strictEqual(constrained2.left, 692)
})
