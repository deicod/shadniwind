import * as React from "react"
import {
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline"

export type BadgeProps = Omit<ViewProps, "style"> & {
  variant?: BadgeVariant
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 2,
    variants: {
      variant: {
        default: {
          backgroundColor: theme.colors.primary,
          borderColor: "transparent",
        },
        secondary: {
          backgroundColor: theme.colors.secondary,
          borderColor: "transparent",
        },
        destructive: {
          backgroundColor: theme.colors.destructive,
          borderColor: "transparent",
        },
        outline: {
          backgroundColor: "transparent",
          borderColor: theme.colors.border,
        },
      },
    },
  },
  label: {
    fontSize: theme.typography.sizes.xs,
    lineHeight: theme.typography.lineHeights.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primaryForeground,
    variants: {
      variant: {
        default: {
          color: theme.colors.primaryForeground,
        },
        secondary: {
          color: theme.colors.secondaryForeground,
        },
        destructive: {
          color: theme.colors.destructiveForeground,
        },
        outline: {
          color: theme.colors.foreground,
        },
      },
    },
  },
}))

export const Badge = React.forwardRef<View, BadgeProps>(
  ({ variant = "default", style, textStyle, children, ...props }, ref) => {
    styles.useVariants({ variant: variant === "default" ? undefined : variant })
    const hasText = typeof children === "string" || typeof children === "number"

    return (
      <View ref={ref} style={[styles.container, style]} {...props}>
        {hasText ? <Text style={[styles.label, textStyle]}>{children}</Text> : children}
      </View>
    )
  },
)

Badge.displayName = "Badge"
