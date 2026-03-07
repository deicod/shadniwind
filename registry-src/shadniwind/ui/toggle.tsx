import * as React from "react"
import {
  Animated,
  Platform,
  Pressable,
  type PressableProps,
  StyleSheet as RNStyleSheet,
  Text,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export type ToggleProps = Omit<PressableProps, "onPress"> & {
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  disabled?: boolean
  children?: React.ReactNode
}

export const Toggle = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  ToggleProps
>(
  (
    {
      pressed: pressedProp,
      defaultPressed = false,
      onPressedChange,
      disabled = false,
      children,
      style,
      onPressIn,
      onPressOut,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledPressed, setUncontrolledPressed] =
      React.useState<boolean>(defaultPressed)

    const isControlled = pressedProp !== undefined
    const pressed = isControlled ? pressedProp : uncontrolledPressed
    const scaleAnim = React.useRef(new Animated.Value(1)).current
    const [isPressing, setIsPressing] = React.useState(false)

    React.useEffect(() => {
      if (disabled) {
        setIsPressing(false)
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
        }).start()
      }
    }, [disabled, scaleAnim])

    const handlePress = React.useCallback(() => {
      if (disabled) return

      const nextPressed = !pressed

      if (!isControlled) {
        setUncontrolledPressed(nextPressed)
      }

      onPressedChange?.(nextPressed)
    }, [pressed, disabled, isControlled, onPressedChange])

    const variantStyles = styles.useVariants({
      pressed,
      disabled,
    })

    const handlePressIn: PressableProps["onPressIn"] = (event) => {
      if (!disabled) {
        setIsPressing(true)
        Animated.spring(scaleAnim, {
          toValue: 0.96,
          useNativeDriver: true,
          speed: 50,
        }).start()
      }
      onPressIn?.(event)
    }

    const handlePressOut: PressableProps["onPressOut"] = (event) => {
      setIsPressing(false)
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
      }).start()
      onPressOut?.(event)
    }

    const userStyle =
      typeof style === "function" ? style({ pressed: isPressing }) : style
    const flatUserStyle = RNStyleSheet.flatten(userStyle) || {}
    const userTransform = flatUserStyle.transform || []

    return (
      <AnimatedPressable
        ref={ref}
        role={Platform.OS === "web" ? "button" : undefined}
        aria-pressed={Platform.OS === "web" ? pressed : undefined}
        aria-disabled={Platform.OS === "web" ? disabled : undefined}
        accessible={true}
        accessibilityRole="button"
        accessibilityState={{
          selected: pressed,
          disabled,
        }}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        {...({
          passthroughAnimatedPropExplicitValues: {
            style: {
              transform: [...userTransform, { scale: isPressing ? 0.96 : 1 }],
            },
          },
        } as any)}
        style={
          [
            styles.toggle,
            variantStyles,
            isPressing && !disabled && styles.togglePressing,
            userStyle,
            {
              transform: [
                ...userTransform,
                { scale: scaleAnim as unknown as number },
              ] as any,
            },
          ] as any
        }
        {...props}
      >
        {typeof children === "string" ? (
          <Text style={[styles.text, pressed && styles.textPressed]}>
            {children}
          </Text>
        ) : (
          children
        )}
      </AnimatedPressable>
    )
  },
)

Toggle.displayName = "Toggle"

const styles = StyleSheet.create((theme) => ({
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    variants: {
      pressed: {
        true: {
          backgroundColor: theme.colors.accent,
          borderColor: theme.colors.accent,
        },
      },
      disabled: {
        true: {
          opacity: 0.5,
        },
      },
    },
  },
  togglePressing: {
    opacity: 0.8,
  },
  text: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.foreground,
  },
  textPressed: {
    color: theme.colors.accentForeground,
  },
}))
