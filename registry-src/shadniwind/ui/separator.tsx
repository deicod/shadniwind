import * as React from "react"
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { StyleSheet } from "react-native-unistyles"

type SeparatorOrientation = "horizontal" | "vertical"

export type SeparatorProps = ViewProps & {
  orientation?: SeparatorOrientation
  decorative?: boolean
  style?: StyleProp<ViewStyle>
}

const separatorStyles = StyleSheet.create((theme) => ({
  separator: {
    flexShrink: 0,
    backgroundColor: theme.colors.border,
    variants: {
      orientation: {
        horizontal: {
          height: 1,
          width: "100%",
        },
        vertical: {
          width: 1,
          height: "100%",
        },
      },
    },
  },
}))

export const Separator = React.forwardRef<View, SeparatorProps>(
  ({ orientation = "horizontal", decorative = true, style, accessibilityRole, ...props }, ref) => {
    const variantStyles = separatorStyles.useVariants({
      orientation,
    }) as typeof separatorStyles | undefined

    const styles = variantStyles ?? separatorStyles
    const isDecorative = decorative ?? true

    return (
      <View
        ref={ref}
        style={[styles.separator, style]}
        accessibilityRole={isDecorative ? undefined : accessibilityRole}
        accessibilityElementsHidden={isDecorative ? true : props.accessibilityElementsHidden}
        importantForAccessibility={isDecorative ? "no" : props.importantForAccessibility}
        accessible={isDecorative ? false : props.accessible}
        {...props}
      />
    )
  },
)

Separator.displayName = "Separator"
