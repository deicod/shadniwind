import type { StyleProp, TextStyle, ViewStyle } from "react-native"

export type InputOTPProps = {
  /** Number of OTP digits (default: 6) */
  length?: number
  /** Enable autoComplete for one-time-code (default: true) */
  autoComplete?: boolean
  /** Controlled value */
  value?: string
  /** Uncontrolled initial value */
  defaultValue?: string
  /** Called when OTP value changes */
  onChangeText?: (value: string) => void
  /** Disabled state */
  disabled?: boolean
  /** Placeholder character for empty slots (default: "") */
  placeholder?: string
  /** Separator pattern - e.g., "-" for "123-456" (default: null) */
  separator?: string | null
  /** Container style */
  style?: StyleProp<ViewStyle>
  /** Slot style override */
  slotStyle?: StyleProp<ViewStyle>
  /** Text style override */
  textStyle?: StyleProp<TextStyle>
}
