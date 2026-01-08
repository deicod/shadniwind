import * as React from "react"
import { View } from "react-native"
import type { FocusScopeProps } from "./types.js"

export const FocusScope = React.forwardRef<View, FocusScopeProps>(
  ({ loop, trapped, onMountAutoFocus, onUnmountAutoFocus, ...props }, ref) => {
    return <View ref={ref} {...props} />
  },
)

FocusScope.displayName = "FocusScope"
