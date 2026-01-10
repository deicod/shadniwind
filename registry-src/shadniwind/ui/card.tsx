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

/**
 * Props for the main Card container.
 */
export type CardProps = ViewProps & {
  style?: StyleProp<ViewStyle>
}

/**
 * Props for the Card header.
 */
export type CardHeaderProps = ViewProps & {
  style?: StyleProp<ViewStyle>
}

/**
 * Props for the Card title.
 */
export type CardTitleProps = TextProps & {
  style?: StyleProp<TextStyle>
}

/**
 * Props for the Card description.
 */
export type CardDescriptionProps = TextProps & {
  style?: StyleProp<TextStyle>
}

/**
 * Props for the Card content area.
 */
export type CardContentProps = ViewProps & {
  style?: StyleProp<ViewStyle>
}

/**
 * Props for the Card footer.
 */
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

/**
 * A flexible container for grouping related content (e.g., product details, user profile).
 * 
 * @example
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Notifications</CardTitle>
 *     <CardDescription>You have 3 unread messages.</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <Text>Check your inbox for more details.</Text>
 *   </CardContent>
 *   <CardFooter>
 *     <Button label="Mark as read" />
 *   </CardFooter>
 * </Card>
 */
export const Card = React.forwardRef<View, CardProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.card, style]} {...props} />
  },
)

Card.displayName = "Card"

/**
 * The header section of a Card, usually containing the Title and Description.
 */
export const CardHeader = React.forwardRef<View, CardHeaderProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.header, style]} {...props} />
  },
)

CardHeader.displayName = "CardHeader"

/**
 * The bolded title of a Card.
 */
export const CardTitle = React.forwardRef<Text, CardTitleProps>(
  ({ style, ...props }, ref) => {
    return <Text ref={ref} style={[styles.title, style]} {...props} />
  },
)

CardTitle.displayName = "CardTitle"

/**
 * A secondary text element under the title, used for additional context.
 */
export const CardDescription = React.forwardRef<Text, CardDescriptionProps>(
  ({ style, ...props }, ref) => {
    return <Text ref={ref} style={[styles.description, style]} {...props} />
  },
)

CardDescription.displayName = "CardDescription"

/**
 * The main body of the Card where primary information resides.
 */
export const CardContent = React.forwardRef<View, CardContentProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.content, style]} {...props} />
  },
)

CardContent.displayName = "CardContent"

/**
 * The bottom section of a Card, often used for action buttons or metadata.
 */
export const CardFooter = React.forwardRef<View, CardFooterProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.footer, style]} {...props} />
  },
)

CardFooter.displayName = "CardFooter"
