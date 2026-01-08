import * as React from "react"
import {
  Platform,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"

const RATIO_MAP: Record<string, number> = {
  "1:1": 1,
  "16:9": 16 / 9,
  "4:3": 4 / 3,
  "3:2": 3 / 2,
  "21:9": 21 / 9,
}

export type AspectRatioPreset = "1:1" | "16:9" | "4:3" | "3:2" | "21:9"

export type AspectRatioProps = Omit<ViewProps, "style"> & {
  /**
   * The aspect ratio as width/height.
   * Can be a number (e.g., 16/9 = 1.777) or a preset string.
   * @default 1
   */
  ratio?: number | AspectRatioPreset
  style?: StyleProp<ViewStyle>
}

function resolveRatio(ratio: AspectRatioProps["ratio"]): number {
  if (ratio === undefined) return 1
  if (typeof ratio === "number") return ratio
  return RATIO_MAP[ratio] ?? 1
}

const styles = StyleSheet.create((_theme) => ({
  container: {
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  content: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
}))

export const AspectRatio = React.forwardRef<View, AspectRatioProps>(
  ({ ratio = 1, style, children, onLayout, ...props }, ref) => {
    const resolvedRatio = resolveRatio(ratio)

    // Web: Use CSS aspect-ratio property
    if (Platform.OS === "web") {
      return (
        <View
          ref={ref}
          style={[styles.container, { aspectRatio: resolvedRatio }, style]}
          onLayout={onLayout}
          {...props}
        >
          <View style={styles.content}>{children}</View>
        </View>
      )
    }

    // Native: Use onLayout measurement trick
    const [width, setWidth] = React.useState<number | null>(null)

    const handleLayout = React.useCallback(
      (event: LayoutChangeEvent) => {
        const { width: measuredWidth } = event.nativeEvent.layout
        setWidth(measuredWidth)
        onLayout?.(event)
      },
      [onLayout],
    )

    const calculatedHeight = width !== null ? width / resolvedRatio : undefined

    return (
      <View
        ref={ref}
        style={[
          styles.container,
          calculatedHeight !== undefined && { height: calculatedHeight },
          style,
        ]}
        onLayout={handleLayout}
        {...props}
      >
        {width !== null && <View style={styles.content}>{children}</View>}
      </View>
    )
  },
)

AspectRatio.displayName = "AspectRatio"
