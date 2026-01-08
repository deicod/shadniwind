import { useCallback, useEffect, useRef, useState } from "react"
import { Dimensions } from "react-native"

import {
  applyFlip,
  computePosition,
  constrainToViewport,
} from "./positioning-utils.js"
import type {
  Placement,
  Position,
  PositioningResult,
  Rect,
  UsePositioningOptions,
  Viewport,
} from "./types.js"

/**
 * Hook for positioning floating content relative to an anchor element.
 * Native implementation using measureInWindow.
 */
export function usePositioning(
  options: UsePositioningOptions,
): PositioningResult {
  const {
    anchorRef,
    contentRef,
    placement: requestedPlacement = "bottom",
    offset = 8,
    alignOffset = 0,
    flip = true,
    collisionPadding = 8,
    open = true,
  } = options

  const [position, setPosition] = useState<Position>({ top: 0, left: 0 })
  const [actualPlacement, setActualPlacement] =
    useState<Placement>(requestedPlacement)
  const [isPositioned, setIsPositioned] = useState(false)

  // Track mount state to prevent updates after unmount
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const measure = useCallback(() => {
    if (!open) {
      setIsPositioned(false)
      return
    }

    const anchor = anchorRef.current
    const content = contentRef.current

    if (!anchor || !content) {
      return
    }

    // Measure anchor position in window coordinates
    anchor.measureInWindow((anchorX, anchorY, anchorWidth, anchorHeight) => {
      if (!isMountedRef.current) return

      // Handle measurement failure (returns 0s or undefined on collapsed views)
      if (anchorWidth === 0 && anchorHeight === 0) {
        return
      }

      // Measure content dimensions
      content.measureInWindow(
        (_contentX, _contentY, contentWidth, contentHeight) => {
          if (!isMountedRef.current) return

          // Content might not be fully laid out yet
          if (contentWidth === 0 && contentHeight === 0) {
            return
          }

          const anchorRect: Rect = {
            x: anchorX,
            y: anchorY,
            width: anchorWidth,
            height: anchorHeight,
          }

          const contentRect: Rect = {
            x: 0,
            y: 0,
            width: contentWidth,
            height: contentHeight,
          }

          // Get viewport dimensions
          const { width: viewportWidth, height: viewportHeight } =
            Dimensions.get("window")
          const viewport: Viewport = {
            width: viewportWidth,
            height: viewportHeight,
          }

          let computedPosition: Position
          let finalPlacement: Placement

          if (flip) {
            const result = applyFlip(
              anchorRect,
              contentRect,
              requestedPlacement,
              offset,
              alignOffset,
              viewport,
              collisionPadding,
            )
            computedPosition = result.position
            finalPlacement = result.placement
          } else {
            computedPosition = computePosition(
              anchorRect,
              contentRect,
              requestedPlacement,
              offset,
              alignOffset,
            )
            finalPlacement = requestedPlacement
          }

          // Constrain to viewport as final fallback
          computedPosition = constrainToViewport(
            computedPosition,
            contentRect,
            viewport,
            collisionPadding,
          )

          setPosition(computedPosition)
          setActualPlacement(finalPlacement)
          setIsPositioned(true)
        },
      )
    })
  }, [
    open,
    anchorRef,
    contentRef,
    requestedPlacement,
    offset,
    alignOffset,
    flip,
    collisionPadding,
  ])

  // Measure when open state changes
  useEffect(() => {
    if (open) {
      // Use requestAnimationFrame to ensure layout is complete
      const rafId = requestAnimationFrame(() => {
        measure()
      })
      return () => cancelAnimationFrame(rafId)
    }
    setIsPositioned(false)
  }, [open, measure])

  // Re-measure on dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", () => {
      if (open) {
        measure()
      }
    })

    return () => subscription.remove()
  }, [open, measure])

  return {
    position,
    actualPlacement,
    isPositioned,
    update: measure,
  }
}
