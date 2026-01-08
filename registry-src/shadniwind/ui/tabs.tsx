import * as React from "react"
import { Platform, Pressable, type PressableProps, Text, View, type ViewProps } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"
import * as RovingFocusGroup from "../primitives/roving-focus/index.js"

const TabsContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

export interface TabsProps extends ViewProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

export const Tabs = React.forwardRef<View, TabsProps>(
  ({ value: valueProp, defaultValue, onValueChange, children, ...props }, ref) => {
    const [value, setValue] = React.useState(valueProp ?? defaultValue)
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
      <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
        <View ref={ref} {...props}>
          {children}
        </View>
      </TabsContext.Provider>
    )
  },
)

Tabs.displayName = "Tabs"

export interface TabsListProps extends ViewProps {}

export const TabsList = React.forwardRef<View, TabsListProps>(
  ({ style, ...props }, ref) => {
    // On web, we want RovingFocusGroup for keyboard nav
    if (Platform.OS === "web") {
      const context = React.useContext(TabsContext)

      return (
        <RovingFocusGroup.RovingFocusGroup
          orientation="horizontal"
          value={context.value}
          onValueChange={context.onValueChange}
          loop
          asChild
          {...props}
        >
          <View ref={ref} style={[styles.list, style]}>
            {props.children}
          </View>
        </RovingFocusGroup.RovingFocusGroup>
      )
    }

    return <View ref={ref} style={[styles.list, style]} {...props} />
  },
)

TabsList.displayName = "TabsList"

export interface TabsTriggerProps extends PressableProps {
  value: string
  disabled?: boolean
}

export const TabsTrigger = React.forwardRef<View, TabsTriggerProps>(
  ({ value, disabled, style, children, ...props }, ref) => {
    const context = React.useContext(TabsContext)
    const isActive = context.value === value

    const { theme } = useUnistyles()
    const variantStyles = styles.useVariants({
      active: isActive,
      disabled: !!disabled,
    })

    const handlePress = () => {
      if (!disabled) {
        context.onValueChange?.(value)
      }
    }

    const content = (
      <Pressable
        ref={ref}
        role="tab"
        aria-selected={isActive}
        aria-disabled={disabled}
        disabled={disabled}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive, disabled: !!disabled }}
        onPress={(e) => {
          handlePress()
          props.onPress?.(e)
        }}
        style={({ pressed }) =>
          [
            styles.trigger,
            variantStyles,
            pressed && !isActive && !disabled && { opacity: 0.7 },
            typeof style === "function" ? style({ pressed }) : style,
          ] as any
        }
        {...props}
      >
        {typeof children === "string" ? (
          <Text
            style={[
              styles.triggerText,
              isActive && styles.triggerTextActive,
            ]}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    )

    if (Platform.OS === "web") {
      return (
        <RovingFocusGroup.RovingFocusItem
          value={value}
          disabled={disabled}
          asChild
        >
          {content}
        </RovingFocusGroup.RovingFocusItem>
      )
    }

    return content
  },
)

TabsTrigger.displayName = "TabsTrigger"

export interface TabsContentProps extends ViewProps {
  value: string
}

export const TabsContent = React.forwardRef<View, TabsContentProps>(
  ({ value, style, ...props }, ref) => {
    const context = React.useContext(TabsContext)
    const isActive = context.value === value

    if (!isActive) return null

    return (
      <View ref={ref} role="tabpanel" style={[styles.content, style]} {...props}>
        {props.children}
      </View>
    )
  },
)

TabsContent.displayName = "TabsContent"

const styles = StyleSheet.create((theme) => ({
  list: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.muted,
    padding: 4,
    borderRadius: theme.radius.lg,
    gap: 4,
  },
  trigger: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    backgroundColor: "transparent",
    variants: {
      active: {
        true: {
          backgroundColor: theme.colors.background,
          shadowColor: theme.colors.foreground,
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 1,
        },
      },
      disabled: {
        true: {
          opacity: 0.5,
        },
      },
    },
  },
  triggerText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: "500",
    color: theme.colors.mutedForeground,
  },
  triggerTextActive: {
    color: theme.colors.foreground,
  },
  content: {
    marginTop: 8,
    // ring offset?
  },
}))
