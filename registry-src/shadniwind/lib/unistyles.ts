import { StyleSheet } from "react-native-unistyles"

import { darkTheme, lightTheme } from "./tokens.js"

// Import this module exactly once, before any StyleSheet.create usage.
StyleSheet.configure({
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  settings: {
    adaptiveThemes: true,
  },
})
