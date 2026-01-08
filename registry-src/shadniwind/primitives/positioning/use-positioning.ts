import { Platform } from "react-native"

import { usePositioning as usePositioningNative } from "./use-positioning.native.js"
import { usePositioning as usePositioningWeb } from "./use-positioning.web.js"

// Runtime platform selection keeps NodeNext extension requirements while preserving platform behavior.
export const usePositioning = Platform.OS === "web" ? usePositioningWeb : usePositioningNative
