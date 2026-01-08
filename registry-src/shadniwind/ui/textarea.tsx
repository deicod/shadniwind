import * as React from "react"
import {
  type StyleProp,
  TextInput,
  type TextInputProps,
  type TextStyle,
} from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

export type TextareaProps = TextInputProps & {
  disabled?: boolean
  style?: StyleProp<TextStyle>
}

const styles = StyleSheet.create((theme) => ({
  textarea: {
    minHeight: theme.spacing[24],
    width: "100%",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.input,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[3],
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    textAlignVertical: "top",
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

export const Textarea = React.forwardRef<TextInput, TextareaProps>(
  (
    {
      style,
      editable,
      disabled,
      placeholderTextColor,
      accessibilityState,
      onFocus,
      onBlur,
      multiline = true,
      textAlignVertical = "top",
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
        style={[styles.textarea, style]}
        editable={isDisabled ? false : editable}
        placeholderTextColor={
          placeholderTextColor ?? theme.colors.mutedForeground
        }
        accessibilityState={{ ...accessibilityState, disabled: isDisabled }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        multiline={multiline}
        textAlignVertical={textAlignVertical}
        {...props}
      />
    )
  },
)

Textarea.displayName = "Textarea"
