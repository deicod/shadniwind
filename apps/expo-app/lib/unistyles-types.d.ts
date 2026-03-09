import type { darkTheme, lightTheme } from "./tokens"

type AppThemes = {
  light: typeof lightTheme
  dark: typeof darkTheme
}

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
}
