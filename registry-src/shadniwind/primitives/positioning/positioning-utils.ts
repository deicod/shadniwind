import type {
  Alignment,
  Placement,
  Position,
  Rect,
  Side,
  Viewport,
} from "./types.js"

/**
 * Parse a placement string into side and alignment components.
 */
export function parsePlacement(placement: Placement): {
  side: Side
  alignment: Alignment
} {
  const [side, alignment = "center"] = placement.split("-") as [
    Side,
    Alignment | undefined,
  ]
  return { side, alignment: alignment ?? "center" }
}

/**
 * Get the opposite side for flip behavior.
 */
export function getOppositeSide(side: Side): Side {
  const opposites: Record<Side, Side> = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
  }
  return opposites[side]
}

/**
 * Compose a placement from side and alignment.
 */
export function composePlacement(side: Side, alignment: Alignment): Placement {
  if (alignment === "center") {
    return side
  }
  return `${side}-${alignment}` as Placement
}

/**
 * Compute the position for floating content given anchor rect, content rect,
 * placement, and offsets.
 */
export function computePosition(
  anchorRect: Rect,
  contentRect: Rect,
  placement: Placement,
  offset: number,
  alignOffset: number,
): Position {
  const { side, alignment } = parsePlacement(placement)

  let top = 0
  let left = 0

  // Compute main axis position (side)
  switch (side) {
    case "top":
      top = anchorRect.y - contentRect.height - offset
      break
    case "bottom":
      top = anchorRect.y + anchorRect.height + offset
      break
    case "left":
      left = anchorRect.x - contentRect.width - offset
      break
    case "right":
      left = anchorRect.x + anchorRect.width + offset
      break
  }

  // Compute cross axis position (alignment)
  if (side === "top" || side === "bottom") {
    // Horizontal alignment
    switch (alignment) {
      case "start":
        left = anchorRect.x + alignOffset
        break
      case "center":
        left = anchorRect.x + (anchorRect.width - contentRect.width) / 2
        break
      case "end":
        left = anchorRect.x + anchorRect.width - contentRect.width - alignOffset
        break
    }
  } else {
    // Vertical alignment (side is left or right)
    switch (alignment) {
      case "start":
        top = anchorRect.y + alignOffset
        break
      case "center":
        top = anchorRect.y + (anchorRect.height - contentRect.height) / 2
        break
      case "end":
        top =
          anchorRect.y + anchorRect.height - contentRect.height - alignOffset
        break
    }
  }

  return { top, left }
}

/**
 * Check if a positioned rect overflows the viewport.
 */
export function detectOverflow(
  position: Position,
  contentRect: Rect,
  viewport: Viewport,
  padding: number,
): { top: boolean; bottom: boolean; left: boolean; right: boolean } {
  return {
    top: position.top < padding,
    bottom: position.top + contentRect.height > viewport.height - padding,
    left: position.left < padding,
    right: position.left + contentRect.width > viewport.width - padding,
  }
}

/**
 * Apply flip middleware: if content overflows on the main axis side,
 * flip to the opposite side.
 */
export function applyFlip(
  anchorRect: Rect,
  contentRect: Rect,
  placement: Placement,
  offset: number,
  alignOffset: number,
  viewport: Viewport,
  padding: number,
): { position: Position; placement: Placement; flipped: boolean } {
  const position = computePosition(
    anchorRect,
    contentRect,
    placement,
    offset,
    alignOffset,
  )
  const overflow = detectOverflow(position, contentRect, viewport, padding)

  const { side, alignment } = parsePlacement(placement)

  // Check if main axis overflows
  let shouldFlip = false
  if (side === "top" && overflow.top) shouldFlip = true
  if (side === "bottom" && overflow.bottom) shouldFlip = true
  if (side === "left" && overflow.left) shouldFlip = true
  if (side === "right" && overflow.right) shouldFlip = true

  if (!shouldFlip) {
    return { position, placement, flipped: false }
  }

  // Try flipped placement
  const flippedSide = getOppositeSide(side)
  const flippedPlacement = composePlacement(flippedSide, alignment)
  const flippedPosition = computePosition(
    anchorRect,
    contentRect,
    flippedPlacement,
    offset,
    alignOffset,
  )
  const flippedOverflow = detectOverflow(
    flippedPosition,
    contentRect,
    viewport,
    padding,
  )

  // Check if flipped position is better (doesn't overflow on main axis)
  let useFlipped = false
  if (flippedSide === "top" && !flippedOverflow.top) useFlipped = true
  if (flippedSide === "bottom" && !flippedOverflow.bottom) useFlipped = true
  if (flippedSide === "left" && !flippedOverflow.left) useFlipped = true
  if (flippedSide === "right" && !flippedOverflow.right) useFlipped = true

  if (useFlipped) {
    return {
      position: flippedPosition,
      placement: flippedPlacement,
      flipped: true,
    }
  }

  // Flipped is not better, keep original
  return { position, placement, flipped: false }
}

/**
 * Constrain position to viewport bounds as a fallback.
 */
export function constrainToViewport(
  position: Position,
  contentRect: Rect,
  viewport: Viewport,
  padding: number,
): Position {
  return {
    top: Math.max(
      padding,
      Math.min(position.top, viewport.height - contentRect.height - padding),
    ),
    left: Math.max(
      padding,
      Math.min(position.left, viewport.width - contentRect.width - padding),
    ),
  }
}
