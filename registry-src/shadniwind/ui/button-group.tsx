import * as React from "react"
import { View, type ViewProps } from "react-native"
import { StyleSheet } from "react-native-unistyles"

export type ButtonGroupOrientation = "horizontal" | "vertical"

export type ButtonGroupProps = ViewProps & {
  /**
   * Orientation of the button group
   * @default "horizontal"
   */
  orientation?: ButtonGroupOrientation
  /**
   * Whether to show separators between buttons
   * @default false
   */
  showSeparators?: boolean
}

/**
 * Button Group component for grouping related buttons together.
 *
 * Automatically handles:
 * - Border radius adjustments (rounded only on outer edges)
 * - Optional separators between buttons
 * - Horizontal or vertical orientation
 *
 * **Note:** This is a presentational wrapper. Use with Button components.
 * Roving focus (keyboard navigation) is automatically handled by native platforms.
 *
 * @example
 * ```tsx
 * <ButtonGroup>
 *   <Button>First</Button>
 *   <Button>Second</Button>
 *   <Button>Third</Button>
 * </ButtonGroup>
 * ```
 */
export const ButtonGroup = React.forwardRef<
  React.ComponentRef<typeof View>,
  ButtonGroupProps
>(
  (
    {
      orientation = "horizontal",
      showSeparators = false,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    styles.useVariants({
      orientation,
    })

    // Extract children array for processing
    const childArray = React.Children.toArray(children)

    return (
      <View ref={ref} style={[styles.container, style]} {...props}>
        {childArray.map((child, index) => {
          const isFirst = index === 0
          const isLast = index === childArray.length - 1
          const isMiddle = !isFirst && !isLast
          // Use child's key if available, or fallback to index
          const key =
            React.isValidElement(child) && child.key != null
              ? child.key
              : `button-${index}`

          return (
            <React.Fragment key={key}>
              <View
                style={[
                  styles.buttonWrapper,
                  orientation === "horizontal"
                    ? {
                        borderTopLeftRadius: isFirst ? undefined : 0,
                        borderBottomLeftRadius: isFirst ? undefined : 0,
                        borderTopRightRadius: isLast ? undefined : 0,
                        borderBottomRightRadius: isLast ? undefined : 0,
                      }
                    : {
                        borderTopLeftRadius: isFirst ? undefined : 0,
                        borderTopRightRadius: isFirst ? undefined : 0,
                        borderBottomLeftRadius: isLast ? undefined : 0,
                        borderBottomRightRadius: isLast ? undefined : 0,
                      },
                  isMiddle && {
                    borderRadius: 0,
                  },
                ]}
              >
                {child}
              </View>
              {showSeparators && !isLast && (
                <View
                  style={[
                    styles.separator,
                    orientation === "vertical" && styles.separatorVertical,
                  ]}
                />
              )}
            </React.Fragment>
          )
        })}
      </View>
    )
  },
)

ButtonGroup.displayName = "ButtonGroup"

const styles = StyleSheet.create((theme) => ({
  container: {
    variants: {
      orientation: {
        horizontal: {
          flexDirection: "row",
          alignItems: "stretch",
        },
        vertical: {
          flexDirection: "column",
          alignItems: "stretch",
        },
      },
    },
  },
  buttonWrapper: {
    overflow: "hidden",
  },
  separator: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  separatorVertical: {
    width: undefined,
    height: 1,
  },
}))
