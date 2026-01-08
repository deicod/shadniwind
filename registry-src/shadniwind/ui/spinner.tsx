import * as React from "react"
import {
  ActivityIndicator,
  type ActivityIndicatorProps,
  type StyleProp,
  type ViewStyle,
} from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

export type SpinnerVariant = "default" | "muted" | "primary"

export type SpinnerProps = ActivityIndicatorProps & {
  variant?: SpinnerVariant
  style?: StyleProp<ViewStyle>
}

const styles = StyleSheet.create((_theme) => ({
  spinner: {
    variants: {
      variant: {
        default: {},
        muted: {
          opacity: 0.7,
        },
        primary: {},
      },
    },
  },
}))

type SpinnerRef = React.ElementRef<typeof ActivityIndicator>

export const Spinner = React.forwardRef<SpinnerRef, SpinnerProps>(
  ({ variant = "default", color, style, ...props }, ref) => {
    const { theme } = useUnistyles()

    styles.useVariants({ variant: variant === "default" ? undefined : variant })

    const resolvedColor =
      color ??
      (variant === "primary"
        ? theme.colors.primary
        : variant === "muted"
          ? theme.colors.mutedForeground
          : theme.colors.foreground)

    return (
      <ActivityIndicator
        ref={ref}
        color={resolvedColor}
        style={[styles.spinner, style]}
        {...props}
      />
    )
  },
)

Spinner.displayName = "Spinner"
