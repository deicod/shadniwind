import type { Theme } from "./tokens.js"

declare module "react-native-unistyles" {
  export interface UnistylesThemes {
    light: Theme
    dark: Theme
  }
}
