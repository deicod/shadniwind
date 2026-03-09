import { StyleSheet } from 'react-native-unistyles'
import { darkTheme, lightTheme } from './tokens'

StyleSheet.configure({
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  settings: {
    adaptiveThemes: true,
  },
})
