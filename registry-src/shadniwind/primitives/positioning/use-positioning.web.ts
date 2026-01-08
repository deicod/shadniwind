import { useCallback, useEffect, useRef, useState } from "react"

import { applyFlip, computePosition, constrainToViewport } from "./positioning-utils.js"
import type { Placement, Position, PositioningResult, Rect, UsePositioningOptions, Viewport } from "./types.js"

/**
 * Hook for positioning floating content relative to an anchor element.
 * Web implementation using getBoundingClientRect.
 */
export function usePositioning(options: UsePositioningOptions): PositioningResult {
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
  const [actualPlacement, setActualPlacement] = useState<Placement>(requestedPlacement)
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

    // On web, views have a DOM node we can measure
    // biome-ignore lint/suspicious/noExplicitAny: accessing web-specific DOM properties
    const anchorElement = (anchor as any)._nativeTag ?? anchor
    // biome-ignore lint/suspicious/noExplicitAny: accessing web-specific DOM properties
    const contentElement = (content as any)._nativeTag ?? content

    // Use getBoundingClientRect for precise measurements
    let anchorDOMRect: DOMRect | undefined
    let contentDOMRect: DOMRect | undefined

    try {
      // Try to get the actual DOM element
      // biome-ignore lint/suspicious/noExplicitAny: accessing web-specific DOM properties
      const getElement = (ref: any): HTMLElement | null => {
        if (ref instanceof HTMLElement) {
          return ref
        }
        if (ref && typeof ref.getBoundingClientRect === "function") {
          return ref
        }
        // React Native Web stores DOM node differently
        if (ref?._nativeTag && typeof ref._nativeTag.getBoundingClientRect === "function") {
          return ref._nativeTag
        }
        return null
      }

      const anchorEl = getElement(anchorElement)
      const contentEl = getElement(contentElement)

      if (!anchorEl || !contentEl) {
        // Fall back to measureInWindow if available (hybrid approach)
        if (typeof anchor.measureInWindow === "function") {
          anchor.measureInWindow((x: number, y: number, width: number, height: number) => {
            if (!isMountedRef.current) return

            if (width === 0 && height === 0) {
              return
            }

            content.measureInWindow((_cx: number, _cy: number, cw: number, ch: number) => {
              if (!isMountedRef.current) return

              if (cw === 0 && ch === 0) {
                return
              }

              const anchorRect: Rect = { x, y, width, height }
              const contentRect: Rect = { x: 0, y: 0, width: cw, height: ch }
              const viewport: Viewport = { width: window.innerWidth, height: window.innerHeight }

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
                  collisionPadding
                )
                computedPosition = result.position
                finalPlacement = result.placement
              } else {
                computedPosition = computePosition(anchorRect, contentRect, requestedPlacement, offset, alignOffset)
                finalPlacement = requestedPlacement
              }

              computedPosition = constrainToViewport(computedPosition, contentRect, viewport, collisionPadding)

              setPosition(computedPosition)
              setActualPlacement(finalPlacement)
              setIsPositioned(true)
            })
          })
          return
        }
        return
      }

      anchorDOMRect = anchorEl.getBoundingClientRect()
      contentDOMRect = contentEl.getBoundingClientRect()
    } catch {
      return
    }

    if (!anchorDOMRect || !contentDOMRect) {
      return
    }

    const anchorRect: Rect = {
      x: anchorDOMRect.left,
      y: anchorDOMRect.top,
      width: anchorDOMRect.width,
      height: anchorDOMRect.height,
    }

    const contentRect: Rect = {
      x: 0,
      y: 0,
      width: contentDOMRect.width,
      height: contentDOMRect.height,
    }

    const viewport: Viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
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
        collisionPadding
      )
      computedPosition = result.position
      finalPlacement = result.placement
    } else {
      computedPosition = computePosition(anchorRect, contentRect, requestedPlacement, offset, alignOffset)
      finalPlacement = requestedPlacement
    }

    // Constrain to viewport as final fallback
    computedPosition = constrainToViewport(computedPosition, contentRect, viewport, collisionPadding)

    setPosition(computedPosition)
    setActualPlacement(finalPlacement)
    setIsPositioned(true)
  }, [open, anchorRef, contentRef, requestedPlacement, offset, alignOffset, flip, collisionPadding])

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

  // Re-measure on resize and scroll
  useEffect(() => {
    if (!open) return

    const handleResize = () => {
      measure()
    }

    const handleScroll = () => {
      measure()
    }

    window.addEventListener("resize", handleResize, { passive: true })
    window.addEventListener("scroll", handleScroll, { passive: true, capture: true })

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll, { capture: true })
    }
  }, [open, measure])

  return {
    position,
    actualPlacement,
    isPositioned,
    update: measure,
  }
}
