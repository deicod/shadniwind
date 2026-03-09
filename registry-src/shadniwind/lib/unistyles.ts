import { StyleSheet } from "react-native-unistyles"

import { darkTheme, lightTheme } from "./tokens.js"

/**
 * Unistyles Initialization.
 *
 * This file configures the `react-native-unistyles` library with our custom themes (light/dark)
 * and settings.
 *
 * IMPORTANT: This file must be imported exactly once from your app entry point
 * BEFORE any components or style sheets are imported.
 *
 * For Expo Router, use a custom `index.ts` entry file and import this module there.
 * If you use Expo static web rendering, also import it from `app/+html.tsx`
 * and render `useServerUnistyles()` inside that file's `<head>`.
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
