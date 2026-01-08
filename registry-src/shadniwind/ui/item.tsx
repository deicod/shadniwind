import * as React from "react"
import { View, type ViewProps } from "react-native"
import { StyleSheet } from "react-native-unistyles"

export type ItemProps = ViewProps & {
  /**
   * Spacing size between items
   * @default "default"
   */
  spacing?: "compact" | "default" | "relaxed"
}

/**
 * Item component - generic container for form items or list items.
 *
 * Provides consistent spacing for vertically stacked items.
 * Similar to FormItem but more generic - can be used outside forms.
 *
 * @example
 * ```tsx
 * <View>
 *   <Item>
 *     <Label>Username</Label>
 *     <Input />
 *   </Item>
 *   <Item>
 *     <Label>Email</Label>
 *     <Input />
 *   </Item>
 * </View>
 * ```
 */
export const Item = React.forwardRef<
  React.ComponentRef<typeof View>,
  ItemProps
>(({ spacing = "default", style, ...props }, ref) => {
  styles.useVariants({
    spacing: spacing === "default" ? undefined : spacing,
  })

  return <View ref={ref} style={[styles.item, style]} {...props} />
})

Item.displayName = "Item"

const styles = StyleSheet.create((_theme) => ({
  item: {
    marginBottom: 16, // Default spacing
    variants: {
      spacing: {
        compact: {
          marginBottom: 8,
        },
        relaxed: {
          marginBottom: 24,
        },
      },
    } as const,
  },
}))
