import { Platform } from "react-native"
import * as RovingFocusNative from "./roving-focus.native.js"
import * as RovingFocusWeb from "./roving-focus.web.js"

export const RovingFocusGroup =
  Platform.OS === "web"
    ? RovingFocusWeb.RovingFocusGroup
    : RovingFocusNative.RovingFocusGroup
export const RovingFocusItem =
  Platform.OS === "web"
    ? RovingFocusWeb.RovingFocusItem
    : RovingFocusNative.RovingFocusItem
