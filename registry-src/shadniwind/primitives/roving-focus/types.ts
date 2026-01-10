import type { ViewProps } from "react-native"

/**
 * Orientation of the focus navigation.
 */
export type Orientation = "horizontal" | "vertical" | "both"

/**
 * Text direction for RTL languages.
 */
export type Direction = "ltr" | "rtl"

/**
 * Props for the RovingFocusGroup container.
 * A RovingFocusGroup manages which of its children is focusable via the tab key.
 * Navigation between children is handled via arrow keys.
 */
export interface RovingFocusGroupProps extends ViewProps {
  /**
   * The orientation of the group. Defines which arrow keys trigger navigation.
   * @default "vertical"
   */
  orientation?: Orientation

  /**
   * The reading direction of the group (for RTL support).
   * @default "ltr"
   */
  dir?: Direction

  /**
   * Whether keyboard navigation should loop from the last item back to the first.
   * @default false
   */
  loop?: boolean

  /**
   * The value of the currently focused item (controlled mode).
   */
  value?: string

  /**
   * The value of the item that should be focusable initially (uncontrolled mode).
   */
  defaultValue?: string

  /**
   * Event handler called when the focused item changes via keyboard navigation.
   */
  onValueChange?: (value: string) => void

  /**
   * If true, the component will merge its props onto its immediate child.
   * @default false
   */
  asChild?: boolean
}

/**
 * Props for an item within a RovingFocusGroup.
 */
export interface RovingFocusItemProps extends ViewProps {
  /**
   * A unique identifier for this item. Used to track focus state in the group.
   */
  value: string

  /**
   * If true, the item will be skipped during keyboard navigation.
   * @default false
   */
  disabled?: boolean

  /**
   * If true, the component will merge its props onto its immediate child.
   * @default false
   */
  asChild?: boolean
}
