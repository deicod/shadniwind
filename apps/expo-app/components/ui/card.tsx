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

export type CardProps = ViewProps & {
  style?: StyleProp<ViewStyle>
}

export type CardHeaderProps = ViewProps & {
  style?: StyleProp<ViewStyle>
}

export type CardTitleProps = TextProps & {
  style?: StyleProp<TextStyle>
}

export type CardDescriptionProps = TextProps & {
  style?: StyleProp<TextStyle>
}

export type CardContentProps = ViewProps & {
  style?: StyleProp<ViewStyle>
}

export type CardFooterProps = ViewProps & {
  style?: StyleProp<ViewStyle>
}

const styles = StyleSheet.create((theme) => ({
  card: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  header: {
    padding: theme.spacing[6],
    paddingBottom: theme.spacing[4],
  },
  title: {
    color: theme.colors.cardForeground,
    fontFamily: theme.typography.families.sans,
    fontSize: theme.typography.sizes.lg,
    lineHeight: theme.typography.lineHeights.lg,
    fontWeight: theme.typography.weights.semibold,
  },
  description: {
    color: theme.colors.mutedForeground,
    fontFamily: theme.typography.families.sans,
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
  },
  content: {
    padding: theme.spacing[6],
    paddingTop: 0,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing[6],
    paddingTop: 0,
  },
}))

export const Card = React.forwardRef<View, CardProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.card, style]} {...props} />
  },
)

Card.displayName = "Card"

export const CardHeader = React.forwardRef<View, CardHeaderProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.header, style]} {...props} />
  },
)

CardHeader.displayName = "CardHeader"

export const CardTitle = React.forwardRef<Text, CardTitleProps>(
  ({ style, ...props }, ref) => {
    return <Text ref={ref} style={[styles.title, style]} {...props} />
  },
)

CardTitle.displayName = "CardTitle"

export const CardDescription = React.forwardRef<Text, CardDescriptionProps>(
  ({ style, ...props }, ref) => {
    return <Text ref={ref} style={[styles.description, style]} {...props} />
  },
)

CardDescription.displayName = "CardDescription"

export const CardContent = React.forwardRef<View, CardContentProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.content, style]} {...props} />
  },
)

CardContent.displayName = "CardContent"

export const CardFooter = React.forwardRef<View, CardFooterProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.footer, style]} {...props} />
  },
)

CardFooter.displayName = "CardFooter"
