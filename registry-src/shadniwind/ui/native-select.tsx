// @ts-expect-error - Peer dependency, user must install
import { Picker, type PickerProps } from "@react-native-picker/picker"
import * as React from "react"
import { Platform, View, type ViewProps } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

export type NativeSelectOption = {
  label: string
  value: string
  disabled?: boolean
}

export type NativeSelectProps = Omit<
  PickerProps,
  "selectedValue" | "onValueChange" | "children"
> &
  ViewProps & {
    /**
     * Current selected value
     */
    value?: string
    /**
     * Callback when selection changes
     */
    onValueChange?: (value: string) => void
    /**
     * Array of options to display
     */
    options: NativeSelectOption[]
    /**
     * Placeholder option
     */
    placeholder?: string
    /**
     * Whether the select is disabled
     */
    disabled?: boolean
    /**
     * Style for the container wrapper
     */
    containerStyle?: ViewProps["style"]
  }

/**
 * Native Select component using the platform's native picker.
 *
 * **Platform differences:**
 * - iOS: Shows bottom sheet picker
 * - Android: Shows dropdown or dialog based on mode
 * - Web: Renders as HTML `<select>` element
 *
 * **Important:** This uses `@react-native-picker/picker`.
 * Install with: `npm install @react-native-picker/picker`
 *
 * @example
 * ```tsx
 * const [value, setValue] = useState('')
 * <NativeSelect
 *   value={value}
 *   onValueChange={setValue}
 *   placeholder="Select option"
 *   options={[
 *     { label: 'Option 1', value: '1' },
 *     { label: 'Option 2', value: '2' }
 *   ]}
 * />
 * ```
 */
export const NativeSelect = React.forwardRef<
  React.ComponentRef<typeof Picker>,
  NativeSelectProps
>(
  (
    {
      value,
      onValueChange,
      options,
      placeholder,
      disabled = false,
      style,
      containerStyle,
      // Extract View-specific props for container
      onLayout,
      onStartShouldSetResponder,
      onMoveShouldSetResponder,
      onResponderGrant,
      onResponderReject,
      onResponderMove,
      onResponderRelease,
      onResponderTerminationRequest,
      onResponderTerminate,
      onStartShouldSetResponderCapture,
      onMoveShouldSetResponderCapture,
      pointerEvents,
      testID,
      // Accessibility props
      accessible,
      accessibilityLabel,
      accessibilityHint,
      accessibilityRole,
      accessibilityState,
      accessibilityActions,
      onAccessibilityAction,
      onAccessibilityTap,
      onMagicTap,
      accessibilityValue,
      accessibilityLiveRegion,
      accessibilityViewIsModal,
      accessibilityElementsHidden,
      importantForAccessibility,
      // Layout props
      hitSlop,
      nativeID,
      // Rest are Picker props
      ...pickerProps
    },
    ref,
  ) => {
    const { theme } = useUnistyles()

    // Collect View props
    const viewProps = {
      onLayout,
      onStartShouldSetResponder,
      onMoveShouldSetResponder,
      onResponderGrant,
      onResponderReject,
      onResponderMove,
      onResponderRelease,
      onResponderTerminationRequest,
      onResponderTerminate,
      onStartShouldSetResponderCapture,
      onMoveShouldSetResponderCapture,
      pointerEvents,
      testID,
      accessible,
      accessibilityLabel,
      accessibilityHint,
      accessibilityRole,
      accessibilityState,
      accessibilityActions,
      onAccessibilityAction,
      onAccessibilityTap,
      onMagicTap,
      accessibilityValue,
      accessibilityLiveRegion,
      accessibilityViewIsModal,
      accessibilityElementsHidden,
      importantForAccessibility,
      hitSlop,
      nativeID,
    }

    return (
      <View style={[styles.container, containerStyle]} {...viewProps}>
        <Picker
          ref={ref}
          selectedValue={value}
          onValueChange={onValueChange}
          enabled={!disabled}
          style={[styles.picker, disabled && styles.pickerDisabled, style]}
          // Web-specific props
          {...(Platform.OS === "web" && {
            // biome-ignore lint/suspicious/noExplicitAny: Web-only props
            accessibilityRole: "combobox" as any,
          })}
          {...pickerProps}
        >
          {placeholder && (
            <Picker.Item
              label={placeholder}
              value=""
              enabled={false}
              color={theme.colors.mutedForeground}
            />
          )}
          {options.map((option: NativeSelectOption) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
              enabled={!option.disabled}
            />
          ))}
        </Picker>
      </View>
    )
  },
)

NativeSelect.displayName = "NativeSelect"

const styles = StyleSheet.create((theme) => ({
  container: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
    overflow: "hidden",
  },
  picker: {
    height: theme.spacing[10],
    width: "100%",
  },
  pickerDisabled: {
    opacity: 0.5,
  },
}))
