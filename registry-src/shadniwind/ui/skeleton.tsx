import * as React from "react"
import {
  Animated,
  Easing,
  type StyleProp,
  type View,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"

export type SkeletonProps = ViewProps & {
  animate?: boolean
  style?: StyleProp<ViewStyle>
}

const styles = StyleSheet.create((theme) => ({
  skeleton: {
    backgroundColor: theme.colors.muted,
    borderRadius: theme.radius.md,
  },
}))

type SkeletonRef = View

export const Skeleton = React.forwardRef<SkeletonRef, SkeletonProps>(
  ({ animate = true, style, ...props }, ref) => {
    const opacity = React.useRef(new Animated.Value(0.6)).current

    React.useEffect(() => {
      if (!animate) {
        opacity.stopAnimation()
        opacity.setValue(1)
        return
      }

      opacity.setValue(0.6)

      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      )

      loop.start()

      return () => {
        loop.stop()
      }
    }, [animate, opacity])

    return (
      <Animated.View
        ref={ref}
        style={[styles.skeleton, style, { opacity }]}
        {...props}
      />
    )
  },
)

Skeleton.displayName = "Skeleton"
