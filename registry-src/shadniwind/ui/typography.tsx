import * as React from "react"
import { Text, type TextProps } from "react-native"
import { StyleSheet } from "react-native-unistyles"

type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "lead"
  | "small"
  | "muted"
  | "mono"

type TypographyAlign = "left" | "center" | "right"

export type TypographyProps = TextProps & {
  variant?: TypographyVariant
  align?: TypographyAlign
}

const styles = StyleSheet.create((theme) => ({
  text: {
    color: theme.colors.foreground,
    fontFamily: theme.typography.families.sans,
    fontSize: theme.typography.sizes.md,
    lineHeight: theme.typography.lineHeights.md,
    fontWeight: theme.typography.weights.normal,
    variants: {
      variant: {
        h1: {
          fontSize: theme.typography.sizes.xl,
          lineHeight: theme.typography.lineHeights.xl,
          fontWeight: theme.typography.weights.bold,
        },
        h2: {
          fontSize: theme.typography.sizes.lg,
          lineHeight: theme.typography.lineHeights.lg,
          fontWeight: theme.typography.weights.semibold,
        },
        h3: {
          fontSize: theme.typography.sizes.md,
          lineHeight: theme.typography.lineHeights.md,
          fontWeight: theme.typography.weights.semibold,
        },
        h4: {
          fontSize: theme.typography.sizes.sm,
          lineHeight: theme.typography.lineHeights.sm,
          fontWeight: theme.typography.weights.semibold,
        },
        h5: {
          fontSize: theme.typography.sizes.sm,
          lineHeight: theme.typography.lineHeights.sm,
          fontWeight: theme.typography.weights.medium,
        },
        h6: {
          fontSize: theme.typography.sizes.xs,
          lineHeight: theme.typography.lineHeights.xs,
          fontWeight: theme.typography.weights.medium,
        },
        p: {
          fontSize: theme.typography.sizes.md,
          lineHeight: theme.typography.lineHeights.md,
        },
        lead: {
          fontSize: theme.typography.sizes.lg,
          lineHeight: theme.typography.lineHeights.lg,
          color: theme.colors.mutedForeground,
        },
        small: {
          fontSize: theme.typography.sizes.xs,
          lineHeight: theme.typography.lineHeights.xs,
        },
        muted: {
          fontSize: theme.typography.sizes.sm,
          lineHeight: theme.typography.lineHeights.sm,
          color: theme.colors.mutedForeground,
        },
        mono: {
          fontFamily: theme.typography.families.mono,
          fontSize: theme.typography.sizes.sm,
          lineHeight: theme.typography.lineHeights.sm,
        },
      },
      align: {
        left: { textAlign: "left" },
        center: { textAlign: "center" },
        right: { textAlign: "right" },
      },
    },
  },
}))

export const Typography = React.forwardRef<Text, TypographyProps>(
  ({ variant = "p", align = "left", style, ...props }, ref) => {
    styles.useVariants({
      variant,
      align,
    })

    return <Text ref={ref} style={[styles.text, style]} {...props} />
  },
)

Typography.displayName = "Typography"
