import { StyleSheet } from "react-native-unistyles"

import { darkTheme, lightTheme } from "./tokens.js"

/**
 * Unistyles Initialization.
 *
 * This file configures the `react-native-unistyles` library with our custom themes (light/dark)
 * and settings.
 *
 * IMPORTANT: This file must be imported exactly once at the very top of your application entry point
 * (e.g., app/_layout.tsx) BEFORE any components or style sheets are imported.
 * Failure to do so will result in Unistyles errors or unstyled content.
 */
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
