// Platform-specific implementations are resolved via bundler:
// - use-positioning.native.ts for iOS/Android
// - use-positioning.web.ts for web

export { usePositioning } from "./use-positioning"

// Re-export types
export type {
  Alignment,
  Placement,
  Position,
  PositioningResult,
  Rect,
  Side,
  UsePositioningOptions,
  Viewport,
} from "./types.js"

// Re-export utilities for advanced usage
export {
  applyFlip,
  composePlacement,
  computePosition,
  constrainToViewport,
  detectOverflow,
  getOppositeSide,
  parsePlacement,
} from "./positioning-utils.js"
