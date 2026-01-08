import * as React from "react"
import { Platform, View, type ViewProps } from "react-native"
import { StyleSheet } from "react-native-unistyles"
import * as RovingFocusGroup from "../primitives/roving-focus/index.js"
import { Toggle, type ToggleProps } from "./toggle.js"

const ToggleGroupContext = React.createContext<{
  size?: "default" | "sm" | "lg"
  variant?: "default" | "outline"
  rovingFocus?: boolean
  disabled?: boolean
}>({
  size: "default",
  variant: "default",
  rovingFocus: true,
  disabled: false,
})

export type ToggleGroupType = "single" | "multiple"

export interface ToggleGroupProps extends ViewProps {
  type: ToggleGroupType
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void // Type depends on 'type' prop really
  disabled?: boolean
  rovingFocus?: boolean
  // Add variants or sizes if your Toggle supports them (our base Toggle is simple currently)
}

export const ToggleGroup = React.forwardRef<View, ToggleGroupProps>(
  (
    {
      type,
      value: valueProp,
      defaultValue,
      onValueChange,
      disabled = false,
      rovingFocus = true,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = React.useState<string | string[] | undefined>(
      valueProp ?? defaultValue,
    )

    const isControlled = valueProp !== undefined
    const currentValue = isControlled ? valueProp : value

    const handleValueChange = React.useCallback(
      (itemValue: string, pressed: boolean) => {
        if (type === "single") {
          const newValue = pressed ? itemValue : "" // Or undefined? usually empty string for single
          // Single select: always one selected? or toggleable?
          // Radix ToggleGroup single: unselecting is possible by default unless 'rovingFocus' implied?
          // Usually single mode allows unselecting unless explicitly required.
          if (!isControlled) setValue(newValue)
          onValueChange?.(newValue)
        } else {
          // Multiple
          const currentArray = (
            Array.isArray(currentValue) ? currentValue : []
          ) as string[]
          let newArray: string[]
          if (pressed) {
            newArray = [...currentArray, itemValue]
          } else {
            newArray = currentArray.filter((v) => v !== itemValue)
          }
          if (!isControlled) setValue(newArray)
          onValueChange?.(newArray)
        }
      },
      [currentValue, isControlled, onValueChange, type],
    )

    const [focusValue, setFocusValue] = React.useState<string | undefined>(
      type === "single" && typeof (valueProp ?? defaultValue) === "string"
        ? ((valueProp ?? defaultValue) as string)
        : undefined,
    )

    React.useEffect(() => {
      if (type === "single" && typeof currentValue === "string") {
        setFocusValue(currentValue)
      }
    }, [currentValue, type])

    const handleItemToggle = React.useCallback(
      (itemValue: string, pressed: boolean) => {
        handleValueChange(itemValue, pressed)
        setFocusValue(itemValue)
      },
      [handleValueChange],
    )

    const content = (
      <View ref={ref} style={[styles.group, style]} {...props}>
          {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                // We need to clone to pass toggle-group logic handling?
                // Or proper context usage.
                // We'll use Context so ToggleGroupItem can read state.
                return child
              }
              return null
            })}
      </View>
    )

    // Context provider needs to expose state management for items to call context.toggle(itemValue)
    // Actually, simple context with atomic actions is cleaner.

    return (
      <ToggleGroupHelperContext.Provider
        value={{
          value: currentValue,
          onItemToggle: handleItemToggle,
          type,
          disabled,
        }}
      >
        <ToggleGroupContext.Provider value={{ rovingFocus, disabled }}>
          {Platform.OS === "web" && rovingFocus ? (
            <RovingFocusGroup.RovingFocusGroup
              orientation="horizontal"
              value={focusValue}
              onValueChange={setFocusValue}
              loop
              asChild
            >
              {content}
            </RovingFocusGroup.RovingFocusGroup>
          ) : (
            content
          )}
        </ToggleGroupContext.Provider>
      </ToggleGroupHelperContext.Provider>
    )
  },
)

ToggleGroup.displayName = "ToggleGroup"

const ToggleGroupHelperContext = React.createContext<{
  value?: string | string[]
  onItemToggle: (value: string, pressed: boolean) => void
  type: ToggleGroupType
  disabled?: boolean
}>({
  value: undefined,
  onItemToggle: () => {},
  type: "single",
  disabled: false,
})

export interface ToggleGroupItemProps extends ToggleProps {
  value: string
}

export const ToggleGroupItem = React.forwardRef<View, ToggleGroupItemProps>(
  ({ value, disabled, ...props }, ref) => {
    const context = React.useContext(ToggleGroupHelperContext)
    const settings = React.useContext(ToggleGroupContext)

    const isPressed = React.useMemo(() => {
        if (context.type === "single") {
            return context.value === value
        }
        if (Array.isArray(context.value)) {
            return context.value.includes(value)
        }
        return false
    }, [context.type, context.value, value])

    const isDisabled = disabled || context.disabled || settings.disabled

    const content = (
      <Toggle
        ref={ref}
        pressed={isPressed}
        onPressedChange={(pressed) => context.onItemToggle(value, pressed)}
        disabled={isDisabled}
        {...props}
      />
    )

    if (Platform.OS === "web" && settings.rovingFocus) {
      return (
        <RovingFocusGroup.RovingFocusItem value={value} disabled={isDisabled} asChild>
          {content}
        </RovingFocusGroup.RovingFocusItem>
      )
    }

    return content
  },
)

ToggleGroupItem.displayName = "ToggleGroupItem"

const styles = StyleSheet.create((theme) => ({
  group: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4, // or -1 margin for connected look? Assuming separate buttons for now.
  },
}))
