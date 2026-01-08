import { Platform } from "react-native"
import { useScrollLock as useScrollLockNative } from "./use-scroll-lock.native.js"
import { useScrollLock as useScrollLockWeb } from "./use-scroll-lock.web.js"

export const useScrollLock =
  Platform.OS === "web" ? useScrollLockWeb : useScrollLockNative
