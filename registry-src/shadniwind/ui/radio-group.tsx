import * as React from "react"
import { Pressable, type PressableProps, type StyleProp, View, type ViewProps, type ViewStyle } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"
// @ts-expect-error - lucide-react-native is a peer dependency
import { Circle } from "lucide-react-native"
import * as RovingFocusGroup from "../primitives/roving-focus/index.js"

const RadioGroupContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}>({})

export interface RadioGroupProps extends ViewProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}

export const RadioGroup = React.forwardRef<View, RadioGroupProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      disabled = false,
      style,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = React.useState<string | undefined>(
      valueProp ?? defaultValue,
    )

    const isControlled = valueProp !== undefined
    const currentValue = isControlled ? valueProp : value

    const handleValueChange = React.useCallback(
      (newValue: string) => {
        if (!isControlled) {
          setValue(newValue)
        }
        onValueChange?.(newValue)
      },
      [isControlled, onValueChange],
    )

    return (
      <RadioGroupContext.Provider
        value={{
          value: currentValue,
          onValueChange: handleValueChange,
          disabled,
        }}
      >
        <RovingFocusGroup.RovingFocusGroup
          orientation="vertical"
          value={currentValue}
          onValueChange={handleValueChange}
          {...props}
          ref={ref}
          style={[styles.group, style]}
        >
          {props.children}
        </RovingFocusGroup.RovingFocusGroup>
      </RadioGroupContext.Provider>
    )
  },
)

RadioGroup.displayName = "RadioGroup"

export interface RadioGroupItemProps extends Omit<PressableProps, "onPress"> {
  value: string
  disabled?: boolean
}

export const RadioGroupItem = React.forwardRef<View, RadioGroupItemProps>(
  ({ value, disabled, style, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext)
    const checked = context.value === value
    const isDisabled = disabled || context.disabled

    const { theme } = useUnistyles()
    const variantStyles = styles.useVariants({
      checked,
      disabled: isDisabled,
    })

    return (
      <RovingFocusGroup.RovingFocusItem value={value} disabled={isDisabled} asChild>
        <Pressable
          ref={ref}
          role="radio"
          aria-checked={checked}
          aria-disabled={isDisabled}
          disabled={isDisabled}
          onPress={() => {
            if (!isDisabled) {
              context.onValueChange?.(value)
            }
          }}
          accessibilityRole="radio"
          accessibilityState={{
            checked,
            disabled: isDisabled,
          }}
          style={({ pressed }) =>
            [
              styles.item,
              variantStyles,
              pressed && !isDisabled && styles.itemPressed,
              typeof style === "function" ? style({ pressed }) : style,
            ] as unknown as StyleProp<ViewStyle>
          }
          {...props}
        >
          {checked && (
            <View style={styles.indicator}>
              <Circle
                fill={theme.colors.primary}
                color={theme.colors.primary}
                size={7}
              />
            </View>
          )}
        </Pressable>
      </RovingFocusGroup.RovingFocusItem>
    )
  },
)

RadioGroupItem.displayName = "RadioGroupItem"

const styles = StyleSheet.create((theme) => ({
  group: {
    gap: 8, // Default gap
  },
  item: {
    height: 16,
    width: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    variants: {
      checked: {
        true: {
          // Keep primary border
        },
        false: {
          // Ensure it's not filled?
          // shadcn: border-primary text-primary
        },
      },
      disabled: {
        true: {
          opacity: 0.5,
        },
      },
    },
  },
  itemPressed: {
    opacity: 0.8,
  },
  indicator: {
    alignItems: "center",
    justifyContent: "center",
  },
}))
