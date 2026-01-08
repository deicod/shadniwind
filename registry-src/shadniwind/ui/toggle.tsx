import * as React from "react"
import { Platform, Pressable, type PressableProps, Text } from "react-native"
import { StyleSheet } from "react-native-unistyles"

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
      ...props
    },
    ref,
  ) => {
    const [uncontrolledPressed, setUncontrolledPressed] =
      React.useState<boolean>(defaultPressed)

    const isControlled = pressedProp !== undefined
    const pressed = isControlled ? pressedProp : uncontrolledPressed

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

    return (
      <Pressable
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
        disabled={disabled}
        style={({ pressed: isPressing }) =>
          [
            styles.toggle,
            variantStyles,
            isPressing && !disabled && styles.togglePressing,
            typeof style === "function"
              ? style({ pressed: isPressing })
              : style,
            // biome-ignore lint/suspicious/noExplicitAny: Complex style array with variants requires type assertion
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
      </Pressable>
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
