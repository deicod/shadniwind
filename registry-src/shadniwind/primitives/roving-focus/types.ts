import type { ViewProps } from "react-native"

export type Orientation = "horizontal" | "vertical" | "both"
export type Direction = "ltr" | "rtl"

export interface RovingFocusGroupProps extends ViewProps {
  /**
   * The orientation of the group.
   * @default "vertical"
   */
  orientation?: Orientation

  /**
   * The direction of the group (for RTL support).
   * @default "ltr"
   */
  dir?: Direction

  /**
   * Whether keyboard navigation should loop around.
   * @default false
   */
  loop?: boolean

  /**
   * The value of the currently focused item (controlled).
   */
  value?: string

  /**
   * The default value of the focused item (uncontrolled).
   */
  defaultValue?: string

  /**
   * Callback when the focused item changes.
   */
  onValueChange?: (value: string) => void

  asChild?: boolean
}

export interface RovingFocusItemProps extends ViewProps {
  /**
   * A unique value for the item.
   */
  value: string

  /**
   * Whether the item is disabled.
   * @default false
   */
  disabled?: boolean

  asChild?: boolean
}
