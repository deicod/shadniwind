import type { PressableProps, StyleProp, ViewStyle } from "react-native"

export interface PressableStateCallbackType {
  readonly pressed: boolean
}

export type StyleCallback = (
  state: PressableStateCallbackType,
) => StyleProp<ViewStyle>

export type PressUtils = (props: PressableProps) => PressableProps
