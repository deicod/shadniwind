import * as React from "react"
import {
  TextInput,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

export type InputProps = TextInputProps & {
  disabled?: boolean
  style?: StyleProp<TextStyle>
}

const styles = StyleSheet.create((theme) => ({
  input: {
    height: theme.spacing[10],
    width: "100%",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.input,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    textAlignVertical: "center",
    color: theme.colors.foreground,
    variants: {
      focused: {
        true: {
          borderColor: theme.colors.ring,
          shadowColor: theme.colors.ring,
          shadowOpacity: 0.35,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 0 },
        },
      },
      disabled: {
        true: {
          opacity: 0.6,
        },
      },
    },
  },
}))

export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      style,
      editable,
      disabled,
      placeholderTextColor,
      accessibilityState,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const { theme } = useUnistyles()
    const isDisabled = disabled || editable === false

    styles.useVariants({
      focused: isFocused,
      disabled: isDisabled,
    })

    const handleFocus = React.useCallback(
      (event: Parameters<NonNullable<TextInputProps["onFocus"]>>[0]) => {
        setIsFocused(true)
        onFocus?.(event)
      },
      [onFocus],
    )

    const handleBlur = React.useCallback(
      (event: Parameters<NonNullable<TextInputProps["onBlur"]>>[0]) => {
        setIsFocused(false)
        onBlur?.(event)
      },
      [onBlur],
    )

    return (
      <TextInput
        ref={ref}
        style={[styles.input, style]}
        editable={isDisabled ? false : editable}
        placeholderTextColor={
          placeholderTextColor ?? theme.colors.mutedForeground
        }
        accessibilityState={{ ...accessibilityState, disabled: isDisabled }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    )
  },
)

Input.displayName = "Input"
