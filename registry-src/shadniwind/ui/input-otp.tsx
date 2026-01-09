import * as React from "react"
import {
  Platform,
  Pressable,
  Text,
  TextInput,
  type ViewStyle,
  View,
} from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"
import { composeRefs } from "../primitives/roving-focus/utils.js"
import type { InputOTPProps } from "./input-otp.types.js"

const DEFAULT_LENGTH = 6
const DEFAULT_PLACEHOLDER = ""

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    gap: theme.spacing[2],
    alignItems: "center",
  },
  slot: {
    width: theme.spacing[10],
    height: theme.spacing[10],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.input,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
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
      filled: {
        true: {
          backgroundColor: theme.colors.muted,
        },
      },
      disabled: {
        true: {
          opacity: 0.5,
        },
      },
    },
  },
  slotText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.foreground,
    fontFamily: theme.typography.families.mono,
    textAlign: "center",
  },
  separator: {
    color: theme.colors.mutedForeground,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    paddingHorizontal: theme.spacing[1],
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
}))

function resolveSlotStyle(
  theme: ReturnType<typeof useUnistyles>["theme"],
  isFilled: boolean,
  isFocused: boolean,
  isDisabled: boolean,
): ViewStyle {
  const base: ViewStyle = {
    width: theme.spacing[10],
    height: theme.spacing[10],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.input,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  }

  if (isFilled) {
    base.backgroundColor = theme.colors.muted
  }

  if (isFocused) {
    base.borderColor = theme.colors.ring
    base.shadowColor = theme.colors.ring
    base.shadowOpacity = 0.35
    base.shadowRadius = 4
    base.shadowOffset = { width: 0, height: 0 }
  }

  if (isDisabled) {
    base.opacity = 0.5
  }

  return base
}

export const InputOTP = React.forwardRef<
  React.ComponentRef<typeof TextInput>,
  InputOTPProps
>(
  (
    {
      length = DEFAULT_LENGTH,
      autoComplete = true,
      value: valueProp,
      defaultValue,
      onChangeText,
      disabled = false,
      placeholder = DEFAULT_PLACEHOLDER,
      separator = null,
      style,
      slotStyle,
      textStyle,
      ...props
    },
    ref,
  ) => {
    const { theme } = useUnistyles()
    const [value, setValue] = React.useState(defaultValue ?? "")
    const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null)
    const [caretIndex, setCaretIndex] = React.useState(0)
    const isControlled = valueProp !== undefined
    const currentValue = isControlled ? valueProp : value
    const inputRef = React.useRef<TextInput>(null)
    const composedRef = composeRefs(ref, inputRef)

    const cleanValue = React.useCallback(
      (val: string): string => {
        let normalized = val
        if (separator) {
          normalized = normalized.replace(
            new RegExp(separator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
            "",
          )
        }
        return normalized.replace(/\D/g, "").slice(0, length)
      },
      [length, separator],
    )

    const handleChangeText = React.useCallback(
      (text: string) => {
        const normalized = cleanValue(text)

        if (!isControlled) {
          setValue(normalized)
        }
        onChangeText?.(normalized)

        setCaretIndex(Math.min(normalized.length, length))

        if (Platform.OS === "web" && normalized.length > 0) {
          const nextIndex = Math.min(normalized.length, length - 1)
          setFocusedIndex(nextIndex)
        }
      },
      [cleanValue, length, isControlled, onChangeText],
    )

    const handleSlotPress = React.useCallback(
      (index: number) => {
        if (disabled) return
        setFocusedIndex(index)
        setCaretIndex(index)
        inputRef.current?.focus()
      },
      [disabled],
    )

    const handleKeyDown = React.useCallback(
      // biome-ignore lint/suspicious/noExplicitAny: Web keyboard event
      (event: any) => {
        if (Platform.OS !== "web") return

        if (event.key === "Backspace") {
          if (
            currentValue.length === 0 ||
            focusedIndex === currentValue.length
          ) {
            const prevIndex = Math.max(
              0,
              (focusedIndex ?? currentValue.length) - 1,
            )
            setFocusedIndex(prevIndex)
            setCaretIndex(prevIndex)
          } else if (caretIndex > 0) {
            setCaretIndex(caretIndex - 1)
          }
        } else if (event.key === "ArrowLeft") {
          const newIndex = Math.max(
            0,
            (focusedIndex ?? currentValue.length) - 1,
          )
          setFocusedIndex(newIndex)
          setCaretIndex(newIndex)
        } else if (event.key === "ArrowRight") {
          const newIndex = Math.min(length - 1, (focusedIndex ?? -1) + 1)
          setFocusedIndex(newIndex)
          setCaretIndex(newIndex)
        }
      },
      [currentValue, focusedIndex, length, caretIndex],
    )

    const handlePaste = React.useCallback(
      // biome-ignore lint/suspicious/noExplicitAny: Web clipboard event
      (event: any) => {
        if (Platform.OS !== "web") return

        event.preventDefault()
        const pastedData = event.clipboardData?.getData("text") ?? ""
        handleChangeText(pastedData)
      },
      [handleChangeText],
    )

    const isDisabled = disabled
    const renderedValue = cleanValue(currentValue)

    styles.useVariants({
      disabled: isDisabled,
    })

    const slotIds = React.useMemo(
      () => Array.from({ length }, (_, i) => `otp-slot-${i}`),
      [length],
    )

    const separatorIndex = separator ? Math.floor(length / 2) : -1

    const renderContent = () => {
      const elements: React.ReactNode[] = []

      slotIds.forEach((key, i) => {
        if (separator && i === separatorIndex) {
          elements.push(
            <Text key="separator" style={styles.separator}>
              {separator}
            </Text>,
          )
        }

        const isFilled = i < renderedValue.length
        const isFocused =
          i === focusedIndex ||
          (focusedIndex === null && i === renderedValue.length)
        const char = renderedValue[i] ?? ""

        elements.push(
          <Pressable
            key={key}
            style={[
              styles.slot,
              resolveSlotStyle(theme, isFilled, isFocused, isDisabled),
              slotStyle,
            ]}
            onPress={() => handleSlotPress(i)}
            accessible={true}
            accessibilityRole={Platform.OS === "web" ? "button" : undefined}
            accessibilityLabel={`OTP digit ${i + 1} of ${length}`}
            accessibilityState={{ disabled: isDisabled }}
            disabled={isDisabled}
          >
            <Text style={[styles.slotText, textStyle]}>
              {char || placeholder}
            </Text>
          </Pressable>,
        )
      })

      return elements
    }

    return (
      <View style={[styles.container, style]} {...props}>
        {renderContent()}
        <TextInput
          ref={composedRef}
          style={styles.hiddenInput}
          value={renderedValue}
          onChangeText={handleChangeText}
          // @ts-expect-error - onKeyDown is web-only
          onKeyDown={Platform.OS === "web" ? handleKeyDown : undefined}
          onPaste={Platform.OS === "web" ? handlePaste : undefined}
          maxLength={length}
          editable={!isDisabled}
          selection={{ start: caretIndex, end: caretIndex }}
          {...Platform.select({
            web: {
              disabled: isDisabled,
              autoComplete: autoComplete ? "one-time-code" : "off",
            },
            ios: { textContentType: autoComplete ? "oneTimeCode" : "none" },
            android: { textContentType: autoComplete ? "oneTimeCode" : "none" },
          })}
          keyboardType="numeric"
          inputMode="numeric"
          selectTextOnFocus={false}
        />
      </View>
    )
  },
)

InputOTP.displayName = "InputOTP"
