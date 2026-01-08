import * as React from "react"
import {
  type StyleProp,
  Text,
  type TextProps,
  type TextStyle,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"

export type AlertVariant = "default" | "destructive"

export type AlertProps = ViewProps & {
  variant?: AlertVariant
  style?: StyleProp<ViewStyle>
}

export type AlertTitleProps = TextProps & {
  style?: StyleProp<TextStyle>
}

export type AlertDescriptionProps = TextProps & {
  style?: StyleProp<TextStyle>
}

const AlertVariantContext = React.createContext<AlertVariant>("default")

const styles = StyleSheet.create((theme) => ({
  container: {
    width: "100%",
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    padding: theme.spacing[4],
    variants: {
      variant: {
        default: {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.background,
        },
        destructive: {
          borderColor: theme.colors.destructive,
          backgroundColor: theme.colors.background,
        },
      },
    },
  },
  title: {
    color: theme.colors.foreground,
    fontFamily: theme.typography.families.sans,
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    fontWeight: theme.typography.weights.semibold,
    marginBottom: theme.spacing[1],
    variants: {
      variant: {
        default: {
          color: theme.colors.foreground,
        },
        destructive: {
          color: theme.colors.destructive,
        },
      },
    },
  },
  description: {
    color: theme.colors.mutedForeground,
    fontFamily: theme.typography.families.sans,
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.md,
    variants: {
      variant: {
        default: {
          color: theme.colors.mutedForeground,
        },
        destructive: {
          color: theme.colors.destructive,
        },
      },
    },
  },
}))

export const Alert = React.forwardRef<View, AlertProps>(
  (
    { variant = "default", style, children, accessibilityRole, ...props },
    ref,
  ) => {
    styles.useVariants({ variant: variant === "default" ? undefined : variant })

    return (
      <AlertVariantContext.Provider value={variant}>
        <View
          ref={ref}
          accessibilityRole={accessibilityRole ?? "alert"}
          style={[styles.container, style]}
          {...props}
        >
          {children}
        </View>
      </AlertVariantContext.Provider>
    )
  },
)

Alert.displayName = "Alert"

export const AlertTitle = React.forwardRef<Text, AlertTitleProps>(
  ({ style, ...props }, ref) => {
    const variant = React.useContext(AlertVariantContext)
    styles.useVariants({ variant: variant === "default" ? undefined : variant })

    return <Text ref={ref} style={[styles.title, style]} {...props} />
  },
)

AlertTitle.displayName = "AlertTitle"

export const AlertDescription = React.forwardRef<Text, AlertDescriptionProps>(
  ({ style, ...props }, ref) => {
    const variant = React.useContext(AlertVariantContext)
    styles.useVariants({ variant: variant === "default" ? undefined : variant })

    return <Text ref={ref} style={[styles.description, style]} {...props} />
  },
)

AlertDescription.displayName = "AlertDescription"
