import * as React from "react"
import { View } from "react-native"
import type { RovingFocusGroupProps, RovingFocusItemProps } from "./types.js"

export const RovingFocusGroup = React.forwardRef<View, RovingFocusGroupProps>(
  (props, ref) => {
    return <View ref={ref} {...props} />
  },
)
RovingFocusGroup.displayName = "RovingFocusGroup"

export const RovingFocusItem = React.forwardRef<View, RovingFocusItemProps>(
  (props, ref) => {
    return <View ref={ref} {...props} />
  },
)
RovingFocusItem.displayName = "RovingFocusItem"
