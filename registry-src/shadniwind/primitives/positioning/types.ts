import type { RefObject } from "react"
import type { View } from "react-native"

/**
 * Placement options for positioned content relative to an anchor.
 */
export type Placement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end"

/**
 * The side of the anchor where content should be placed.
 */
export type Side = "top" | "bottom" | "left" | "right"

/**
 * Alignment along the placement axis.
 */
export type Alignment = "start" | "center" | "end"

/**
 * Measured rectangle coordinates (in screen/window space).
 */
export type Rect = {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Computed position for the floating content.
 */
export type Position = {
  top: number
  left: number
}

/**
 * Result returned by the positioning hook.
 */
export type PositioningResult = {
  /** Current computed position (top/left) */
  position: Position
  /** The final placement after collision handling (may differ from requested) */
  actualPlacement: Placement
  /** Whether measurement is complete and position is valid */
  isPositioned: boolean
  /** Trigger a re-measurement */
  update: () => void
}

/**
 * Options for the usePositioning hook.
 */
export type UsePositioningOptions = {
  /** Ref to the anchor/trigger element */
  anchorRef: RefObject<View | null>
  /** Ref to the floating content element */
  contentRef: RefObject<View | null>
  /** Desired placement of content relative to anchor */
  placement?: Placement
  /** Offset from the anchor (in pixels) */
  offset?: number
  /** Side offset for alignment (in pixels) */
  alignOffset?: number
  /** Whether to flip to opposite side on collision */
  flip?: boolean
  /** Padding from viewport edges for collision detection */
  collisionPadding?: number
  /** Whether positioning is currently active/open */
  open?: boolean
}

/**
 * Viewport dimensions for collision detection.
 */
export type Viewport = {
  width: number
  height: number
}
