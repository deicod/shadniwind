import * as React from "react"
import { Text, View, type ViewProps } from "react-native"
import { StyleSheet } from "react-native-unistyles"

export type InputGroupProps = ViewProps

/**
 * Input Group component for combining input with addons, icons, or buttons.
 *
 * This is a layout wrapper that helps you compose:
 * - Text addons (prefix/suffix labels)
 * - Icons
 * - Buttons attached to inputs
 *
 * **Usage Pattern:**
 * - Use InputGroupInput wrapper around Input for proper flex behavior
 * - Use InputGroupAddon for text labels
 * - Use InputGroupIcon for icon containers
 * - Use regular Button components for attached buttons
 *
 * @example
 * ```tsx
 * <InputGroup>
 *   <InputGroupAddon>https://</InputGroupAddon>
 *   <InputGroupInput>
 *     <Input
 *       placeholder="example.com"
 *       style={{ borderWidth: 0, borderRadius: 0 }}
 *     />
 *   </InputGroupInput>
 * </InputGroup>
 *
 * <InputGroup>
 *   <InputGroupInput>
 *     <Input
 *       placeholder="Search..."
 *       style={{ borderWidth: 0, borderRadius: 0 }}
 *     />
 *   </InputGroupInput>
 *   <Button>Search</Button>
 * </InputGroup>
 * ```
 */
export const InputGroup = React.forwardRef<
  React.ComponentRef<typeof View>,
  InputGroupProps
>(({ style, ...props }, ref) => {
  return <View ref={ref} style={[styles.group, style]} {...props} />
})

InputGroup.displayName = "InputGroup"

export type InputGroupAddonProps = ViewProps & {
  /**
   * Position of the addon
   * @default "left"
   */
  position?: "left" | "right"
}

/**
 * Text addon for InputGroup (e.g., URL prefix, unit suffix).
 */
export const InputGroupAddon = React.forwardRef<
  React.ComponentRef<typeof View>,
  InputGroupAddonProps
>(({ position = "left", style, children, ...props }, ref) => {
  return (
    <View
      ref={ref}
      style={[styles.addon, position === "right" && styles.addonRight, style]}
      {...props}
    >
      {typeof children === "string" ? (
        <Text style={styles.addonText}>{children}</Text>
      ) : (
        children
      )}
    </View>
  )
})

InputGroupAddon.displayName = "InputGroupAddon"

export type InputGroupIconProps = ViewProps & {
  /**
   * Position of the icon
   * @default "left"
   */
  position?: "left" | "right"
}

/**
 * Icon container for InputGroup.
 */
export const InputGroupIcon = React.forwardRef<
  React.ComponentRef<typeof View>,
  InputGroupIconProps
>(({ position = "left", style, ...props }, ref) => {
  return (
    <View
      ref={ref}
      style={[styles.icon, position === "right" && styles.iconRight, style]}
      {...props}
    />
  )
})

InputGroupIcon.displayName = "InputGroupIcon"

export type InputGroupInputProps = ViewProps

/**
 * Input wrapper for InputGroup.
 *
 * **Important:** Use this wrapper around your Input component
 * to ensure proper flex behavior.
 *
 * **Note:** You must remove borders from the Input to avoid double borders:
 * ```tsx
 * <Input style={{ borderWidth: 0, borderRadius: 0 }} />
 * ```
 *
 * @example
 * ```tsx
 * <InputGroup>
 *   <InputGroupAddon>$</InputGroupAddon>
 *   <InputGroupInput>
 *     <Input
 *       placeholder="0.00"
 *       style={{ borderWidth: 0, borderRadius: 0 }}
 *     />
 *   </InputGroupInput>
 * </InputGroup>
 * ```
 */
export const InputGroupInput = React.forwardRef<
  React.ComponentRef<typeof View>,
  InputGroupInputProps
>(({ style, ...props }, ref) => {
  return <View ref={ref} style={[styles.inputWrapper, style]} {...props} />
})

InputGroupInput.displayName = "InputGroupInput"

const styles = StyleSheet.create((theme) => ({
  group: {
    flexDirection: "row",
    alignItems: "stretch",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
    overflow: "hidden",
  },
  addon: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.muted,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  addonRight: {
    borderRightWidth: 0,
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border,
  },
  addonText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.mutedForeground,
  },
  icon: {
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  iconRight: {
    // Same styling for right-positioned icons
  },
  inputWrapper: {
    flex: 1,
    // Remove borders from child Input to avoid duplication
  },
}))
