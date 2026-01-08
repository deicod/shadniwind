import * as React from "react"
import {
  Animated,
  Easing,
  type LayoutChangeEvent,
  type StyleProp,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"

export type ProgressProps = ViewProps & {
  value?: number
  min?: number
  max?: number
  indeterminate?: boolean
  animate?: boolean
  style?: StyleProp<ViewStyle>
  indicatorStyle?: StyleProp<ViewStyle>
}

const styles = StyleSheet.create((theme) => ({
  root: {
    height: theme.spacing[2],
    width: "100%",
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.muted,
    overflow: "hidden",
  },
  indicator: {
    height: "100%",
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
  },
}))

type ProgressRef = React.ElementRef<typeof View>

export const Progress = React.forwardRef<ProgressRef, ProgressProps>(
  (
    {
      value,
      min = 0,
      max = 100,
      indeterminate,
      animate = true,
      style,
      indicatorStyle,
      onLayout,
      accessibilityRole,
      accessibilityValue,
      ...props
    },
    ref,
  ) => {
    const [width, setWidth] = React.useState(0)
    const translateX = React.useRef(new Animated.Value(0)).current

    const isIndeterminate =
      indeterminate ?? (value === undefined || value === null)
    const clampedValue = React.useMemo(() => {
      if (typeof value !== "number" || Number.isNaN(value)) {
        return min
      }
      return Math.min(Math.max(value, min), max)
    }, [max, min, value])

    const ratio = max > min ? (clampedValue - min) / (max - min) : 0
    const percent = Math.max(0, Math.min(1, ratio))

    const barWidth = React.useMemo(() => {
      if (width <= 0) {
        return 0
      }
      return Math.max(width * 0.4, 24)
    }, [width])

    React.useEffect(() => {
      if (!isIndeterminate || !animate || width <= 0 || barWidth <= 0) {
        translateX.stopAnimation()
        return
      }

      translateX.setValue(-barWidth)

      const loop = Animated.loop(
        Animated.timing(translateX, {
          toValue: width,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      )

      loop.start()

      return () => {
        loop.stop()
      }
    }, [animate, barWidth, isIndeterminate, translateX, width])

    const handleLayout = React.useCallback(
      (event: LayoutChangeEvent) => {
        setWidth(event.nativeEvent.layout.width)
        onLayout?.(event)
      },
      [onLayout],
    )

    const indicatorStyles = isIndeterminate
      ? {
          width: barWidth,
          transform: [{ translateX }],
        }
      : {
          width: `${Math.round(percent * 100)}%` as `${number}%`,
        }

    const resolvedAccessibilityValue =
      accessibilityValue ??
      (isIndeterminate
        ? { min, max }
        : {
            min,
            max,
            now: clampedValue,
          })

    return (
      <View
        ref={ref}
        accessibilityRole={accessibilityRole ?? "progressbar"}
        accessibilityValue={resolvedAccessibilityValue}
        onLayout={handleLayout}
        style={[styles.root, style]}
        {...props}
      >
        <Animated.View
          style={[styles.indicator, indicatorStyles, indicatorStyle]}
        />
      </View>
    )
  },
)

Progress.displayName = "Progress"
