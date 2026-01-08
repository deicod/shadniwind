import * as React from "react"
import { Text, type TextProps } from "react-native"
import { StyleSheet } from "react-native-unistyles"

/**
 * Label component for form inputs.
 *
 * **Important differences from web:**
 * - React Native does not support `htmlFor` or click-to-focus behavior
 * - Labels should be placed directly adjacent to their associated inputs
 * - Use `accessibilityLabelledBy` on inputs if needed for screen readers
 * - Consider wrapping label + input in a container View for semantic grouping
 *
 * @example
 * ```tsx
 * <View>
 *   <Label>Email</Label>
 *   <Input placeholder="Enter email" />
 * </View>
 * ```
 */
export type LabelProps = TextProps & {
  /**
   * Whether the label is for a disabled input.
   * This will apply disabled styling (reduced opacity).
   */
  disabled?: boolean
}

export const Label = React.forwardRef<
  React.ComponentRef<typeof Text>,
  LabelProps
>(({ disabled = false, style, children, ...props }, ref) => {
  const variantStyles = styles.useVariants({
    disabled,
  })

  return (
    <Text
      ref={ref}
      style={
        [
          styles.label,
          variantStyles,
          style,
          // biome-ignore lint/suspicious/noExplicitAny: Style array type assertion
        ] as any
      }
      {...props}
    >
      {children}
    </Text>
  )
})

Label.displayName = "Label"

const styles = StyleSheet.create((theme) => ({
  label: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    lineHeight: theme.typography.lineHeights.sm,
    color: theme.colors.foreground,
    marginBottom: 8,
    variants: {
      disabled: {
        true: {
          opacity: 0.5,
        },
      },
    },
  },
}))
