import * as React from "react"
import { ScrollView, type ScrollViewProps } from "react-native"
import { StyleSheet } from "react-native-unistyles"

export type ScrollAreaProps = ScrollViewProps

/**
 * Scroll Area component - a styled wrapper around ScrollView.
 *
 * On web, you can optionally style scrollbars using CSS.
 * On native, uses the platform's default scrollbars.
 *
 * @example
 * ```tsx
 * <ScrollArea style={{ maxHeight: 300 }}>
 *   <View>
 *     {/* Your scrollable content *\/}
 *   </View>
 * </ScrollArea>
 * ```
 */
export const ScrollArea = React.forwardRef<
  React.ComponentRef<typeof ScrollView>,
  ScrollAreaProps
>(({ style, children, ...props }, ref) => {
  return (
    <ScrollView
      ref={ref}
      style={[styles.scrollArea, style]}
      showsVerticalScrollIndicator={true}
      showsHorizontalScrollIndicator={true}
      {...props}
    >
      {children}
    </ScrollView>
  )
})

ScrollArea.displayName = "ScrollArea"

const styles = StyleSheet.create((_theme) => ({
  scrollArea: {
    width: "100%",
  },
}))
