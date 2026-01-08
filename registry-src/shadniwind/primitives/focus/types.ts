import type { ViewProps } from "react-native"

export interface FocusScopeProps extends ViewProps {
  /**
   * Whether to loop focus when reaching the end of the scope.
   * @default false
   */
  loop?: boolean

  /**
   * Whether to trap focus within the scope.
   * @default false
   */
  trapped?: boolean

  /**
   * Event handler called when auto-focusing on mount.
   * Can be prevented.
   */
  onMountAutoFocus?: (event: Event) => void

  /**
   * Event handler called when auto-focusing on unmount.
   * Can be prevented.
   */
  onUnmountAutoFocus?: (event: Event) => void
}
