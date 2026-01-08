// @ts-expect-error - lucide-react-native is a peer dependency
import { Check, Minus } from "lucide-react-native"
import * as React from "react"
import { Platform, Pressable, type PressableProps } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

export type CheckedState = boolean | "indeterminate"

export type CheckboxProps = Omit<PressableProps, "onPress"> & {
  checked?: CheckedState
  defaultChecked?: CheckedState
  onCheckedChange?: (checked: CheckedState) => void
  disabled?: boolean
}

export const Checkbox = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  CheckboxProps
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
      React.useState<CheckedState>(defaultChecked)

    const isControlled = checkedProp !== undefined
    const checked = isControlled ? checkedProp : uncontrolledChecked

    const handlePress = React.useCallback(() => {
      if (disabled) return

      const nextChecked = checked === "indeterminate" ? true : !checked

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
      checked: checked === true || checked === "indeterminate",
      disabled,
    })

    const { theme } = useUnistyles()

    return (
      <Pressable
        ref={ref}
        role={Platform.OS === "web" ? "checkbox" : undefined}
        aria-checked={
          Platform.OS === "web"
            ? checked === "indeterminate"
              ? "mixed"
              : checked
            : undefined
        }
        aria-disabled={Platform.OS === "web" ? disabled : undefined}
        accessible={true}
        accessibilityRole="checkbox"
        accessibilityState={{
          checked: checked === "indeterminate" ? "mixed" : checked === true,
          disabled,
        }}
        onPress={handlePress}
        // @ts-expect-error - onKeyDown is web-only
        onKeyDown={Platform.OS === "web" ? handleKeyDown : undefined}
        disabled={disabled}
        style={({ pressed }) =>
          [
            styles.checkbox,
            variantStyles,
            pressed && !disabled && styles.checkboxPressed,
            typeof style === "function" ? style({ pressed }) : style,
            // biome-ignore lint/suspicious/noExplicitAny: Complex style array with variants requires type assertion
          ] as any
        }
        {...props}
      >
        {checked === true && (
          <Check size={16} color={theme.colors.primaryForeground} />
        )}
        {checked === "indeterminate" && (
          <Minus size={16} color={theme.colors.primaryForeground} />
        )}
      </Pressable>
    )
  },
)

Checkbox.displayName = "Checkbox"

const styles = StyleSheet.create((theme) => ({
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    alignItems: "center",
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
  checkboxPressed: {
    opacity: 0.8,
  },
}))
