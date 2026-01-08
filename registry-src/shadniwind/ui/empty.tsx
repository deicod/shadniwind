import * as React from "react"
import {
  Text,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"

export type EmptyProps = Omit<ViewProps, "style"> & {
  style?: StyleProp<ViewStyle>
}

export type EmptyIconProps = Omit<ViewProps, "style"> & {
  style?: StyleProp<ViewStyle>
}

export type EmptyTitleProps = Omit<TextProps, "style"> & {
  style?: StyleProp<TextStyle>
}

export type EmptyDescriptionProps = Omit<TextProps, "style"> & {
  style?: StyleProp<TextStyle>
}

export type EmptyActionProps = Omit<ViewProps, "style"> & {
  style?: StyleProp<ViewStyle>
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
    gap: theme.spacing[3],
  },
  icon: {
    marginBottom: theme.spacing[1],
  },
  title: {
    color: theme.colors.foreground,
    fontFamily: theme.typography.families.sans,
    fontSize: theme.typography.sizes.lg,
    lineHeight: theme.typography.lineHeights.lg,
    fontWeight: theme.typography.weights.semibold,
    textAlign: "center",
  },
  description: {
    color: theme.colors.mutedForeground,
    fontFamily: theme.typography.families.sans,
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.md,
    textAlign: "center",
    maxWidth: 280,
  },
  action: {
    marginTop: theme.spacing[1],
    flexDirection: "row",
    gap: theme.spacing[2],
  },
}))

export const Empty = React.forwardRef<View, EmptyProps>(
  ({ style, children, ...props }, ref) => {
    return (
      <View ref={ref} style={[styles.container, style]} {...props}>
        {children}
      </View>
    )
  },
)

Empty.displayName = "Empty"

export const EmptyIcon = React.forwardRef<View, EmptyIconProps>(
  ({ style, children, ...props }, ref) => {
    return (
      <View ref={ref} style={[styles.icon, style]} {...props}>
        {children}
      </View>
    )
  },
)

EmptyIcon.displayName = "EmptyIcon"

export const EmptyTitle = React.forwardRef<Text, EmptyTitleProps>(
  ({ style, ...props }, ref) => {
    return <Text ref={ref} style={[styles.title, style]} {...props} />
  },
)

EmptyTitle.displayName = "EmptyTitle"

export const EmptyDescription = React.forwardRef<Text, EmptyDescriptionProps>(
  ({ style, ...props }, ref) => {
    return <Text ref={ref} style={[styles.description, style]} {...props} />
  },
)

EmptyDescription.displayName = "EmptyDescription"

export const EmptyAction = React.forwardRef<View, EmptyActionProps>(
  ({ style, children, ...props }, ref) => {
    return (
      <View ref={ref} style={[styles.action, style]} {...props}>
        {children}
      </View>
    )
  },
)

EmptyAction.displayName = "EmptyAction"
