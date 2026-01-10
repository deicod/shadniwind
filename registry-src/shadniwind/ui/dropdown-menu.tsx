import * as React from "react"
import {
  Platform,
  Pressable,
  type PressableProps,
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  Text,
  type TextProps,
  type TextStyle,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"
// @ts-expect-error - lucide-react-native is a peer dependency
import { Check, Circle } from "lucide-react-native"
import { FocusScope } from "../primitives/focus/index.js"
import { DismissLayer } from "../primitives/overlay/index.js"
import { Portal } from "../primitives/portal/index.js"
import {
  type Placement,
  usePositioning,
} from "../primitives/positioning/index.js"
import { composeEventHandlers } from "../primitives/press/index.js"
import * as RovingFocusGroup from "../primitives/roving-focus/index.js"

type DropdownMenuContextValue = {
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerRef: React.RefObject<View | null>
  contentRef: React.RefObject<View | null>
  modal: boolean
  activeValue?: string
  setActiveValue: (value?: string) => void
  triggerId: string
}

const DropdownMenuContext = React.createContext<
  DropdownMenuContextValue | undefined
>(undefined)

function useDropdownMenu() {
  const context = React.useContext(DropdownMenuContext)
  if (!context) {
    throw new Error("DropdownMenu components must be used within DropdownMenu")
  }
  return context
}

export type DropdownMenuProps = {
  children: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
}

export function DropdownMenu({
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  modal = false,
}: DropdownMenuProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [activeValue, setActiveValue] = React.useState<string | undefined>(
    undefined,
  )
  const triggerRef = React.useRef<View>(null)
  const contentRef = React.useRef<View>(null)
  const triggerId = React.useId()

  const isControlled = openProp !== undefined
  const currentOpen = isControlled ? openProp : open

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange],
  )

  React.useEffect(() => {
    if (!currentOpen) {
      setActiveValue(undefined)
    }
  }, [currentOpen])

  return (
    <DropdownMenuContext.Provider
      value={{
        open: !!currentOpen,
        onOpenChange: handleOpenChange,
        triggerRef,
        contentRef,
        modal,
        activeValue,
        setActiveValue,
        triggerId,
      }}
    >
      {children}
    </DropdownMenuContext.Provider>
  )
}

export type DropdownMenuTriggerProps = PressableProps & { asChild?: boolean }

export const DropdownMenuTrigger = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  DropdownMenuTriggerProps
>(({ children, asChild, onPress, disabled, ...props }, ref) => {
  const { open, onOpenChange, triggerRef, triggerId } = useDropdownMenu()
  const isDisabled = !!disabled

  const handlePress = React.useCallback(
    (event: unknown) => {
      if (isDisabled) return
      onOpenChange(!open)
      // @ts-expect-error - React Native event type
      onPress?.(event)
    },
    [isDisabled, onOpenChange, onPress, open],
  )

  React.useEffect(() => {
    if (ref) {
      if (typeof ref === "function") {
        ref(triggerRef.current)
      } else {
        ;(ref as { current: View | null }).current = triggerRef.current
      }
    }
  }, [ref, triggerRef])

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onPress?: (event: unknown) => void
    }>
    const childOnPress = isDisabled ? undefined : child.props.onPress
    // biome-ignore lint/suspicious/noExplicitAny: Cloning logic
    return React.cloneElement(child as React.ReactElement<any>, {
      ref: triggerRef,
      onPress: composeEventHandlers(childOnPress, handlePress),
      role: Platform.OS === "web" ? "button" : undefined,
      "aria-expanded": Platform.OS === "web" ? open : undefined,
      "aria-haspopup": Platform.OS === "web" ? "menu" : undefined,
      accessibilityRole: "button",
      accessibilityState: {
        expanded: open,
        disabled: isDisabled,
      },
      disabled: isDisabled,
      nativeID: triggerId,
      ...props,
    })
  }

  return (
    <Pressable
      ref={triggerRef}
      role={Platform.OS === "web" ? "button" : undefined}
      aria-expanded={Platform.OS === "web" ? open : undefined}
      aria-haspopup={Platform.OS === "web" ? "menu" : undefined}
      accessibilityRole="button"
      accessibilityState={{
        expanded: open,
        disabled: isDisabled,
      }}
      disabled={isDisabled}
      nativeID={triggerId}
      onPress={handlePress}
      {...props}
    >
      {children}
    </Pressable>
  )
})

DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

export type DropdownMenuContentProps = ViewProps & {
  side?: Placement
  sideOffset?: number
  align?: "start" | "center" | "end"
  alignOffset?: number
  avoidCollisions?: boolean
  dismissable?: boolean
  onDismiss?: () => void
  viewportProps?: ScrollViewProps
}

export const DropdownMenuContent = React.forwardRef<
  View,
  DropdownMenuContentProps
>(
  (
    {
      children,
      side = "bottom",
      sideOffset = 4,
      align = "start",
      alignOffset = 0,
      avoidCollisions = true,
      dismissable = true,
      onDismiss,
      style,
      viewportProps,
      ...props
    },
    ref,
  ) => {
    const {
      open,
      onOpenChange,
      triggerRef,
      contentRef,
      modal,
      activeValue,
      setActiveValue,
      triggerId,
    } = useDropdownMenu()

    const actualPlacement = align === "center" ? side : `${side}-${align}`

    const { position, isPositioned } = usePositioning({
      anchorRef: triggerRef,
      contentRef: contentRef,
      placement: actualPlacement as Placement,
      offset: sideOffset,
      alignOffset,
      flip: avoidCollisions,
      open,
    })

    const handleDismiss = React.useCallback(() => {
      onOpenChange(false)
      onDismiss?.()
    }, [onDismiss, onOpenChange])

    const setContentRef = React.useCallback(
      (node: View | null) => {
        contentRef.current = node
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ;(ref as { current: View | null }).current = node
        }
      },
      [contentRef, ref],
    )

    if (!open) return null

    return (
      <Portal>
        <DismissLayer
          onDismiss={handleDismiss}
          dismissable={dismissable}
          scrim={false}
          scrimStyle={styles.overlay}
        >
          <FocusScope trapped={modal} loop={true} style={styles.container}>
            <View
              ref={setContentRef}
              role={Platform.OS === "web" ? "menu" : undefined}
              aria-labelledby={Platform.OS === "web" ? triggerId : undefined}
              style={[
                styles.content,
                {
                  position: "absolute",
                  opacity: isPositioned ? 1 : 0,
                  top: position.top,
                  left: position.left,
                },
                style,
              ]}
              {...props}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                {...viewportProps}
                contentContainerStyle={[
                  styles.viewport,
                  viewportProps?.contentContainerStyle,
                ]}
              >
                <RovingFocusGroup.RovingFocusGroup
                  orientation="vertical"
                  value={activeValue}
                  onValueChange={setActiveValue}
                  loop
                >
                  {children}
                </RovingFocusGroup.RovingFocusGroup>
              </ScrollView>
            </View>
          </FocusScope>
        </DismissLayer>
      </Portal>
    )
  },
)

DropdownMenuContent.displayName = "DropdownMenuContent"

type DropdownMenuItemRole = "menuitem" | "menuitemcheckbox" | "menuitemradio"

type DropdownMenuItemBaseProps = Omit<PressableProps, "children" | "role"> & {
  children?: React.ReactNode
  inset?: boolean
  disabled?: boolean
  closeOnSelect?: boolean
  value?: string
  shortcut?: string
  indicator?: React.ReactNode
  role?: DropdownMenuItemRole
  ariaChecked?: boolean
}

const DropdownMenuItemBase = React.forwardRef<
  View,
  DropdownMenuItemBaseProps
>(
  (
    {
      children,
      inset,
      disabled,
      closeOnSelect = true,
      value,
      shortcut,
      indicator,
      role,
      ariaChecked,
      style,
      onPress,
      onFocus,
      onHoverIn,
      ...props
    },
    ref,
  ) => {
    const { onOpenChange, activeValue, setActiveValue } = useDropdownMenu()
    const generatedId = React.useId()
    const itemValue = value ?? generatedId
    const isDisabled = !!disabled
    const isActive = activeValue === itemValue

    const variantStyles = styles.useVariants({
      inset,
      active: isActive,
      disabled: isDisabled,
    })

    const handlePress = React.useCallback(
      (event: unknown) => {
        if (isDisabled) return
        // @ts-expect-error - React Native event type
        onPress?.(event)
        if (closeOnSelect) {
          onOpenChange(false)
        }
      },
      [closeOnSelect, isDisabled, onOpenChange, onPress],
    )

    const handleHoverIn = React.useCallback(
      (event: unknown) => {
        if (isDisabled) return
        setActiveValue(itemValue)
        // @ts-expect-error - React Native event type
        onHoverIn?.(event)
      },
      [isDisabled, itemValue, onHoverIn, setActiveValue],
    )

    const handleFocus = React.useCallback(
      (event: unknown) => {
        if (isDisabled) return
        setActiveValue(itemValue)
        // @ts-expect-error - React Native event type
        onFocus?.(event)
      },
      [isDisabled, itemValue, onFocus, setActiveValue],
    )

    const handleKeyDown = React.useCallback(
      // biome-ignore lint/suspicious/noExplicitAny: Web-only keyboard event type
      (event: any) => {
        if (Platform.OS !== "web" || isDisabled) return
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          handlePress(event)
        }
      },
      [handlePress, isDisabled],
    )

    return (
      <RovingFocusGroup.RovingFocusItem
        value={itemValue}
        disabled={isDisabled}
        asChild
      >
        <Pressable
          ref={ref}
          role={
            Platform.OS === "web"
              ? ((role ?? "menuitem") as unknown as "menuitem")
              : undefined
          }
          aria-checked={
            Platform.OS === "web" && ariaChecked !== undefined
              ? ariaChecked
              : undefined
          }
          aria-disabled={Platform.OS === "web" ? isDisabled : undefined}
          accessibilityRole="menuitem"
          accessibilityState={{
            disabled: isDisabled,
            checked: ariaChecked,
          }}
          disabled={isDisabled}
          onPress={handlePress}
          onHoverIn={handleHoverIn}
          onFocus={handleFocus}
          // @ts-expect-error - onKeyDown is web-only
          onKeyDown={Platform.OS === "web" ? handleKeyDown : undefined}
          style={({ pressed }) =>
            [
              styles.item,
              variantStyles,
              pressed && !isDisabled && styles.itemPressed,
              typeof style === "function" ? style({ pressed }) : style,
              // biome-ignore lint/suspicious/noExplicitAny: Complex style array with variants requires type assertion
            ] as any
          }
          {...props}
        >
          {indicator ? (
            <View style={styles.itemIndicator}>{indicator}</View>
          ) : null}
          <View style={styles.itemContent}>
            {typeof children === "string" || typeof children === "number" ? (
              <Text style={styles.itemText}>{children}</Text>
            ) : (
              children
            )}
          </View>
          {shortcut ? (
            <Text style={styles.shortcut}>{shortcut}</Text>
          ) : null}
        </Pressable>
      </RovingFocusGroup.RovingFocusItem>
    )
  },
)

DropdownMenuItemBase.displayName = "DropdownMenuItemBase"

export type DropdownMenuItemProps = Omit<
  DropdownMenuItemBaseProps,
  "role" | "ariaChecked" | "indicator"
> & {
  indicator?: never
}

export const DropdownMenuItem = React.forwardRef<View, DropdownMenuItemProps>(
  (props, ref) => {
    return (
      <DropdownMenuItemBase ref={ref} role="menuitem" {...props} />
    )
  },
)

DropdownMenuItem.displayName = "DropdownMenuItem"

export type DropdownMenuCheckboxItemProps = Omit<
  DropdownMenuItemBaseProps,
  "role" | "ariaChecked"
> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const DropdownMenuCheckboxItem = React.forwardRef<
  View,
  DropdownMenuCheckboxItemProps
>(
  (
    {
      checked: checkedProp,
      defaultChecked = false,
      onCheckedChange,
      onPress,
      closeOnSelect = true,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledChecked, setUncontrolledChecked] =
      React.useState(defaultChecked)
    const isControlled = checkedProp !== undefined
    const checked = isControlled ? checkedProp : uncontrolledChecked
    const { theme } = useUnistyles()

    const handlePress = React.useCallback(
      (event: unknown) => {
        const nextChecked = !checked
        if (!isControlled) {
          setUncontrolledChecked(nextChecked)
        }
        onCheckedChange?.(nextChecked)
        // @ts-expect-error - React Native event type
        onPress?.(event)
      },
      [checked, isControlled, onCheckedChange, onPress],
    )

    return (
      <DropdownMenuItemBase
        ref={ref}
        role="menuitemcheckbox"
        ariaChecked={checked}
        closeOnSelect={closeOnSelect}
        indicator={
          checked ? <Check size={16} color={theme.colors.accentForeground} /> : null
        }
        onPress={handlePress}
        {...props}
      />
    )
  },
)

DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"

type DropdownMenuRadioGroupContextValue = {
  value?: string
  onValueChange?: (value: string) => void
}

const DropdownMenuRadioGroupContext =
  React.createContext<DropdownMenuRadioGroupContextValue | null>(null)

export type DropdownMenuRadioGroupProps = ViewProps & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

export const DropdownMenuRadioGroup = React.forwardRef<
  View,
  DropdownMenuRadioGroupProps
>(({ value: valueProp, defaultValue, onValueChange, ...props }, ref) => {
  const [value, setValue] = React.useState(valueProp ?? defaultValue)
  const isControlled = valueProp !== undefined
  const currentValue = isControlled ? valueProp : value

  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setValue(nextValue)
      }
      onValueChange?.(nextValue)
    },
    [isControlled, onValueChange],
  )

  return (
    <DropdownMenuRadioGroupContext.Provider
      value={{ value: currentValue, onValueChange: handleValueChange }}
    >
      <View ref={ref} {...props} />
    </DropdownMenuRadioGroupContext.Provider>
  )
})

DropdownMenuRadioGroup.displayName = "DropdownMenuRadioGroup"

export type DropdownMenuRadioItemProps = Omit<
  DropdownMenuItemBaseProps,
  "role" | "ariaChecked"
> & {
  value: string
}

export const DropdownMenuRadioItem = React.forwardRef<
  View,
  DropdownMenuRadioItemProps
>(({ value, onPress, closeOnSelect = true, ...props }, ref) => {
  const context = React.useContext(DropdownMenuRadioGroupContext)
  if (!context) {
    throw new Error("DropdownMenuRadioItem must be used within DropdownMenuRadioGroup")
  }
  const { theme } = useUnistyles()
  const checked = context.value === value

  const handlePress = React.useCallback(
    (event: unknown) => {
      context.onValueChange?.(value)
      // @ts-expect-error - React Native event type
      onPress?.(event)
    },
    [context, onPress, value],
  )

  return (
    <DropdownMenuItemBase
      ref={ref}
      value={value}
      role="menuitemradio"
      ariaChecked={checked}
      closeOnSelect={closeOnSelect}
      indicator={
        checked ? (
          <Circle size={10} fill={theme.colors.accentForeground} color={theme.colors.accentForeground} />
        ) : null
      }
      onPress={handlePress}
      {...props}
    />
  )
})

DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem"

export type DropdownMenuLabelProps = TextProps & {
  style?: StyleProp<TextStyle>
}

export const DropdownMenuLabel = React.forwardRef<Text, DropdownMenuLabelProps>(
  ({ style, ...props }, ref) => {
    return <Text ref={ref} style={[styles.label, style]} {...props} />
  },
)

DropdownMenuLabel.displayName = "DropdownMenuLabel"

export type DropdownMenuSeparatorProps = ViewProps & {
  style?: StyleProp<ViewStyle>
}

export const DropdownMenuSeparator = React.forwardRef<
  View,
  DropdownMenuSeparatorProps
>(({ style, ...props }, ref) => {
  return <View ref={ref} style={[styles.separator, style]} {...props} />
})

DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

export type DropdownMenuGroupProps = ViewProps

export const DropdownMenuGroup = React.forwardRef<View, DropdownMenuGroupProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.group, style]} {...props} />
  },
)

DropdownMenuGroup.displayName = "DropdownMenuGroup"

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  overlay: {
    backgroundColor: "transparent",
  },
  content: {
    zIndex: 50,
    minWidth: 180,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.popover,
    paddingVertical: theme.spacing[2],
    shadowColor: theme.colors.foreground,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    maxHeight: 300,
  },
  viewport: {
    paddingHorizontal: theme.spacing[1],
    gap: theme.spacing[1],
  },
  item: {
    minHeight: theme.spacing[8],
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    variants: {
      inset: {
        true: {
          paddingLeft: theme.spacing[8],
        },
      },
      active: {
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
  itemPressed: {
    backgroundColor: theme.colors.muted,
  },
  itemIndicator: {
    width: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    color: theme.colors.popoverForeground,
  },
  shortcut: {
    marginLeft: "auto",
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.mutedForeground,
  },
  label: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    fontSize: theme.typography.sizes.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: theme.colors.mutedForeground,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing[1],
  },
  group: {
    gap: theme.spacing[1],
    paddingVertical: theme.spacing[1],
  },
}))
