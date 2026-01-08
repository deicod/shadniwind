import { Platform } from "react-native"

import { FocusScope as FocusScopeNative } from "./focus-scope.native.js"
import { FocusScope as FocusScopeWeb } from "./focus-scope.web.js"

export const FocusScope =
  Platform.OS === "web" ? FocusScopeWeb : FocusScopeNative
