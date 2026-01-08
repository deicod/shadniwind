import * as React from "react"
import {
  Platform,
  type StyleProp,
  Text,
  type TextProps,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"

/** Common keyboard modifier symbols */
export const KBD_SYMBOLS = {
  cmd: "\u2318",
  ctrl: "\u2303",
  shift: "\u21E7",
  alt: "\u2325",
  enter: "\u21B5",
  backspace: "\u232B",
  tab: "\u21E5",
  esc: "\u238B",
  space: "\u2423",
  up: "\u2191",
  down: "\u2193",
  left: "\u2190",
  right: "\u2192",
} as const

export type KbdVariant = "default" | "outline"
export type KbdSize = "default" | "sm" | "lg"

export type KbdProps = Omit<TextProps, "style"> & {
  /** Visual variant */
  variant?: KbdVariant
  /** Size preset */
  size?: KbdSize
  /** Style for the container */
  style?: StyleProp<ViewStyle>
  /** Style for the text */
  textStyle?: StyleProp<TextStyle>
}

// Web-specific inline style (display: inline-flex not in RN types)
const webInlineStyle =
  Platform.OS === "web"
    ? ({ display: "inline-flex" } as unknown as ViewStyle)
    : undefined

const styles = StyleSheet.create((theme) => ({
  container: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.muted,
    paddingHorizontal: theme.spacing[1],
    paddingVertical: 2,
    variants: {
      variant: {
        default: {
          backgroundColor: theme.colors.muted,
          borderColor: theme.colors.border,
        },
        outline: {
          backgroundColor: "transparent",
          borderColor: theme.colors.border,
        },
      },
      size: {
        default: {
          paddingHorizontal: theme.spacing[1],
          paddingVertical: 2,
        },
        sm: {
          paddingHorizontal: 3,
          paddingVertical: 1,
        },
        lg: {
          paddingHorizontal: theme.spacing[2],
          paddingVertical: theme.spacing[1],
        },
      },
    },
  },
  text: {
    fontFamily: theme.typography.families.mono,
    fontSize: theme.typography.sizes.xs,
    lineHeight: theme.typography.lineHeights.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.foreground,
    variants: {
      size: {
        default: {
          fontSize: theme.typography.sizes.xs,
          lineHeight: theme.typography.lineHeights.xs,
        },
        sm: {
          fontSize: 10,
          lineHeight: 14,
        },
        lg: {
          fontSize: theme.typography.sizes.sm,
          lineHeight: theme.typography.lineHeights.sm,
        },
      },
    },
  },
}))

export const Kbd = React.forwardRef<View, KbdProps>(
  (
    {
      variant = "default",
      size = "default",
      style,
      textStyle,
      children,
      ...textProps
    },
    ref,
  ) => {
    styles.useVariants({
      variant: variant === "default" ? undefined : variant,
      size: size === "default" ? undefined : size,
    })

    return (
      <View ref={ref} style={[styles.container, webInlineStyle, style]}>
        <Text style={[styles.text, textStyle]} {...textProps}>
          {children}
        </Text>
      </View>
    )
  },
)

Kbd.displayName = "Kbd"
