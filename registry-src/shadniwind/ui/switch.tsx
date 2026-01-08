import * as React from "react"
import {
  Animated,
  Platform,
  Pressable,
  type PressableProps,
} from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

export type SwitchProps = Omit<PressableProps, "onPress"> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}

export const Switch = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  SwitchProps
>(
  (
    {
      checked: checkedProp,
      defaultChecked = false,
      onCheckedChange,
      disabled = false,
      style,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledChecked, setUncontrolledChecked] =
      React.useState<boolean>(defaultChecked)

    const isControlled = checkedProp !== undefined
    const checked = isControlled ? checkedProp : uncontrolledChecked

    const knobPosition = React.useRef(
      new Animated.Value(checked ? 1 : 0),
    ).current

    React.useEffect(() => {
      Animated.spring(knobPosition, {
        toValue: checked ? 1 : 0,
        useNativeDriver: true,
        friction: 7,
        tension: 40,
      }).start()
    }, [checked, knobPosition])

    const handlePress = React.useCallback(() => {
      if (disabled) return

      const nextChecked = !checked

      if (!isControlled) {
        setUncontrolledChecked(nextChecked)
      }

      onCheckedChange?.(nextChecked)
    }, [checked, disabled, isControlled, onCheckedChange])

    const handleKeyDown = React.useCallback(
      // biome-ignore lint/suspicious/noExplicitAny: Web-only keyboard event type
      (event: any) => {
        if (Platform.OS === "web" && event.key === " ") {
          event.preventDefault()
          handlePress()
        }
      },
      [handlePress],
    )

    const variantStyles = styles.useVariants({
      checked,
      disabled,
    })

    const { theme } = useUnistyles()

    const knobTranslateX = knobPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [2, 22],
    })

    return (
      <Pressable
        ref={ref}
        role={Platform.OS === "web" ? "switch" : undefined}
        aria-checked={Platform.OS === "web" ? checked : undefined}
        aria-disabled={Platform.OS === "web" ? disabled : undefined}
        accessible={true}
        accessibilityRole="switch"
        accessibilityState={{
          checked,
          disabled,
        }}
        onPress={handlePress}
        // @ts-expect-error - onKeyDown is web-only
        onKeyDown={Platform.OS === "web" ? handleKeyDown : undefined}
        disabled={disabled}
        style={({ pressed }) =>
          [
            styles.track,
            variantStyles,
            pressed && !disabled && styles.trackPressed,
            typeof style === "function" ? style({ pressed }) : style,
            // biome-ignore lint/suspicious/noExplicitAny: Complex style array with variants requires type assertion
          ] as any
        }
        {...props}
      >
        <Animated.View
          style={[
            styles.knob,
            {
              transform: [{ translateX: knobTranslateX }],
              backgroundColor: checked
                ? theme.colors.background
                : theme.colors.mutedForeground,
            },
          ]}
        />
      </Pressable>
    )
  },
)

Switch.displayName = "Switch"

const styles = StyleSheet.create((theme) => ({
  track: {
    width: 44,
    height: 24,
    borderRadius: 24,
    backgroundColor: theme.colors.input,
    borderWidth: 2,
    borderColor: theme.colors.input,
    justifyContent: "center",
    variants: {
      checked: {
        true: {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        },
      },
      disabled: {
        true: {
          opacity: 0.5,
        },
      },
    },
  },
  trackPressed: {
    opacity: 0.8,
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
}))
