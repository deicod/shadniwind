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
import { DismissLayer } from "../primitives/overlay/index.js"
import { Portal } from "../primitives/portal/index.js"
import {
  type Placement,
  usePositioning,
} from "../primitives/positioning/index.js"
import { composeEventHandlers } from "../primitives/press/index.js"
import * as RovingFocusGroup from "../primitives/roving-focus/index.js"

type MenubarContextValue = {
  openValue?: string
  setOpenValue: (value?: string) => void
  activeValue?: string
  setActiveValue: (value: string) => void
}

const MenubarContext = React.createContext<MenubarContextValue | undefined>(
  undefined,
)

function useMenubar() {
  const context = React.useContext(MenubarContext)
  if (!context) {
    throw new Error("Menubar components must be used within Menubar")
  }
  return context
}

type MenubarMenuContextValue = {
  value: string
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<View | null>
  contentRef: React.RefObject<View | null>
  activeValue?: string
  setActiveValue: (value?: string) => void
  triggerId: string
}

const MenubarMenuContext = React.createContext<MenubarMenuContextValue | undefined>(
  undefined,
)

function useMenubarMenu() {
  const context = React.useContext(MenubarMenuContext)
  if (!context) {
    throw new Error("Menubar components must be used within MenubarMenu")
  }
  return context
}

export type MenubarProps = ViewProps & {
  value?: string
  defaultValue?: string
  onValueChange?: (value?: string) => void
}

export const Menubar = React.forwardRef<View, MenubarProps>(
  ({ value: valueProp, defaultValue, onValueChange, style, ...props }, ref) => {
    const [openValue, setOpenValueState] = React.useState<string | undefined>(
      defaultValue,
    )
    const [activeValue, setActiveValueState] = React.useState<string | undefined>(
      valueProp ?? defaultValue,
    )
    const isControlled = valueProp !== undefined
    const currentOpenValue = isControlled ? valueProp : openValue

    const handleOpenValueChange = React.useCallback(
      (nextValue?: string) => {
        if (!isControlled) {
          setOpenValueState(nextValue)
        }
        onValueChange?.(nextValue)
      },
      [isControlled, onValueChange],
    )

    const handleActiveValueChange = React.useCallback(
      (nextValue: string) => {
        setActiveValueState(nextValue)
        if (currentOpenValue !== undefined) {
          handleOpenValueChange(nextValue)
        }
      },
      [currentOpenValue, handleOpenValueChange],
    )

    React.useEffect(() => {
      if (currentOpenValue !== undefined) {
        setActiveValueState(currentOpenValue)
      }
    }, [currentOpenValue])

    return (
      <MenubarContext.Provider
        value={{
          openValue: currentOpenValue,
          setOpenValue: handleOpenValueChange,
          activeValue,
          setActiveValue: handleActiveValueChange,
        }}
      >
        <RovingFocusGroup.RovingFocusGroup
          ref={ref}
          orientation="horizontal"
          value={activeValue}
          onValueChange={handleActiveValueChange}
          loop
          role={Platform.OS === "web" ? "menubar" : undefined}
          style={[styles.menubar, style]}
          {...props}
        />
      </MenubarContext.Provider>
    )
  },
)

Menubar.displayName = "Menubar"

export type MenubarMenuProps = {
  value?: string
  children: React.ReactNode
}

export function MenubarMenu({ value, children }: MenubarMenuProps) {
  const { openValue, setOpenValue, setActiveValue } = useMenubar()
  const generatedId = React.useId()
  const menuValue = value ?? generatedId
  const open = openValue === menuValue
  const triggerRef = React.useRef<View>(null)
  const contentRef = React.useRef<View>(null)
  const [activeItemValue, setActiveItemValue] = React.useState<
    string | undefined
  >(undefined)
  const triggerId = React.useId()

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      const nextValue = nextOpen ? menuValue : undefined
      setOpenValue(nextValue)
      if (nextOpen) {
        setActiveValue(menuValue)
      }
    },
    [menuValue, setActiveValue, setOpenValue],
  )

  React.useEffect(() => {
    if (!open) {
      setActiveItemValue(undefined)
    }
  }, [open])

  return (
    <MenubarMenuContext.Provider
      value={{
        value: menuValue,
        open,
        setOpen,
        triggerRef,
        contentRef,
        activeValue: activeItemValue,
        setActiveValue: setActiveItemValue,
        triggerId,
      }}
    >
      {children}
    </MenubarMenuContext.Provider>
  )
}

export type MenubarTriggerProps = PressableProps & {
  asChild?: boolean
  onKeyDown?: (event: unknown) => void
}

export const MenubarTrigger = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  MenubarTriggerProps
>(
  (
    {
      children,
      asChild,
      onPress,
      onHoverIn,
      onHoverOut,
      onFocus,
      onBlur,
      onKeyDown,
      disabled,
      style,
      ...props
    },
    ref,
  ) => {
    const { openValue, setActiveValue } = useMenubar()
    const { open, setOpen, triggerRef, triggerId, value } = useMenubarMenu()
    const isDisabled = !!disabled
    const isAnyOpen = openValue !== undefined

    const variantStyles = styles.useVariants({
      open,
      disabled: isDisabled,
    })

    const handlePress = React.useCallback(
      (event: unknown) => {
        if (isDisabled) return
        setOpen(!open)
        // @ts-expect-error - React Native event type
        onPress?.(event)
      },
      [isDisabled, onPress, open, setOpen],
    )

    const handleHoverIn = React.useCallback(
      (event: unknown) => {
        if (isDisabled) return
        if (Platform.OS === "web" && isAnyOpen) {
          setActiveValue(value)
        }
        // @ts-expect-error - React Native event type
        onHoverIn?.(event)
      },
      [isAnyOpen, isDisabled, onHoverIn, setActiveValue, value],
    )

    const handleHoverOut = React.useCallback(
      (event: unknown) => {
        if (isDisabled) return
        // @ts-expect-error - React Native event type
        onHoverOut?.(event)
      },
      [isDisabled, onHoverOut],
    )

    const handleFocus = React.useCallback(
      (event: unknown) => {
        if (isDisabled) return
        setActiveValue(value)
        // @ts-expect-error - React Native event type
        onFocus?.(event)
      },
      [isDisabled, onFocus, setActiveValue, value],
    )

    const handleBlur = React.useCallback(
      (event: unknown) => {
        if (isDisabled) return
        // @ts-expect-error - React Native event type
        onBlur?.(event)
      },
      [isDisabled, onBlur],
    )

    const handleKeyDown = React.useCallback(
      // biome-ignore lint/suspicious/noExplicitAny: Web-only keyboard event type
      (event: any) => {
        if (Platform.OS !== "web" || isDisabled) return
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          setOpen(true)
        } else if (event.key === "ArrowDown") {
          event.preventDefault()
          setOpen(true)
        } else if (event.key === "ArrowUp") {
          event.preventDefault()
          setOpen(true)
        } else if (event.key === "Escape") {
          event.preventDefault()
          setOpen(false)
        }
        onKeyDown?.(event)
      },
      [isDisabled, onKeyDown, setOpen],
    )

    const setTriggerRef = React.useCallback(
      (node: View | null) => {
        triggerRef.current = node
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ;(ref as { current: View | null }).current = node
        }
      },
      [ref, triggerRef],
    )

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{
        onPress?: (event: unknown) => void
        onHoverIn?: (event: unknown) => void
        onHoverOut?: (event: unknown) => void
        onFocus?: (event: unknown) => void
        onBlur?: (event: unknown) => void
        onKeyDown?: (event: unknown) => void
      }>
      const childOnPress = isDisabled ? undefined : child.props.onPress
      const childOnHoverIn = isDisabled ? undefined : child.props.onHoverIn
      const childOnHoverOut = isDisabled ? undefined : child.props.onHoverOut
      const childOnFocus = isDisabled ? undefined : child.props.onFocus
      const childOnBlur = isDisabled ? undefined : child.props.onBlur
      const childOnKeyDown = isDisabled ? undefined : child.props.onKeyDown
      // biome-ignore lint/suspicious/noExplicitAny: Cloning logic
      const trigger = React.cloneElement(child as React.ReactElement<any>, {
        ref: setTriggerRef,
        onPress: composeEventHandlers(childOnPress, handlePress),
        onHoverIn: composeEventHandlers(childOnHoverIn, handleHoverIn),
        onHoverOut: composeEventHandlers(childOnHoverOut, handleHoverOut),
        onFocus: composeEventHandlers(childOnFocus, handleFocus),
        onBlur: composeEventHandlers(childOnBlur, handleBlur),
        onKeyDown: composeEventHandlers(childOnKeyDown, handleKeyDown),
        role: Platform.OS === "web" ? "menuitem" : undefined,
        "aria-expanded": Platform.OS === "web" ? open : undefined,
        "aria-haspopup": Platform.OS === "web" ? "menu" : undefined,
        accessibilityRole: "menuitem",
        accessibilityState: {
          expanded: open,
          disabled: isDisabled,
        },
        disabled: isDisabled,
        nativeID: triggerId,
        ...props,
      })

      return (
        <RovingFocusGroup.RovingFocusItem
          value={value}
          disabled={isDisabled}
          asChild
        >
          {trigger}
        </RovingFocusGroup.RovingFocusItem>
      )
    }

    return (
      <RovingFocusGroup.RovingFocusItem value={value} disabled={isDisabled} asChild>
        <Pressable
          ref={setTriggerRef}
          role={Platform.OS === "web" ? "menuitem" : undefined}
          aria-expanded={Platform.OS === "web" ? open : undefined}
          aria-haspopup={Platform.OS === "web" ? "menu" : undefined}
          accessibilityRole="menuitem"
          accessibilityState={{
            expanded: open,
            disabled: isDisabled,
          }}
          disabled={isDisabled}
          nativeID={triggerId}
          onPress={handlePress}
          onHoverIn={handleHoverIn}
          onHoverOut={handleHoverOut}
          onFocus={handleFocus}
          onBlur={handleBlur}
          // @ts-expect-error - onKeyDown is web-only
          onKeyDown={Platform.OS === "web" ? handleKeyDown : undefined}
          style={({ pressed }) =>
            [
              styles.trigger,
              variantStyles,
              pressed && !isDisabled && styles.triggerPressed,
              typeof style === "function" ? style({ pressed }) : style,
              // biome-ignore lint/suspicious/noExplicitAny: Complex style array with variants requires type assertion
            ] as any
          }
          {...props}
        >
          {typeof children === "string" || typeof children === "number" ? (
            <Text style={styles.triggerText}>{children}</Text>
          ) : (
            children
          )}
        </Pressable>
      </RovingFocusGroup.RovingFocusItem>
    )
  },
)

MenubarTrigger.displayName = "MenubarTrigger"

export type MenubarContentProps = ViewProps & {
  side?: Placement
  sideOffset?: number
  align?: "start" | "center" | "end"
  alignOffset?: number
  avoidCollisions?: boolean
  dismissable?: boolean
  onDismiss?: () => void
  viewportProps?: ScrollViewProps
}

export const MenubarContent = React.forwardRef<View, MenubarContentProps>(
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
    const { open, setOpen, triggerRef, contentRef, activeValue, setActiveValue, triggerId } =
      useMenubarMenu()

    const actualPlacement = align === "center" ? side : `${side}-${align}`

    const { position, isPositioned } = usePositioning({
      anchorRef: triggerRef,
      contentRef,
      placement: actualPlacement as Placement,
      offset: sideOffset,
      alignOffset,
      flip: avoidCollisions,
      open,
    })

    const handleDismiss = React.useCallback(() => {
      setOpen(false)
      onDismiss?.()
    }, [onDismiss, setOpen])

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
          <View style={styles.container}>
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
          </View>
        </DismissLayer>
      </Portal>
    )
  },
)

MenubarContent.displayName = "MenubarContent"

type MenubarItemRole = "menuitem" | "menuitemcheckbox" | "menuitemradio"

type MenubarItemBaseProps = Omit<PressableProps, "children" | "role"> & {
  children?: React.ReactNode
  inset?: boolean
  disabled?: boolean
  closeOnSelect?: boolean
  value?: string
  shortcut?: string
  indicator?: React.ReactNode
  role?: MenubarItemRole
  ariaChecked?: boolean
}

const MenubarItemBase = React.forwardRef<View, MenubarItemBaseProps>(
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
    const { setOpen, activeValue, setActiveValue } = useMenubarMenu()
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
          setOpen(false)
        }
      },
      [closeOnSelect, isDisabled, onPress, setOpen],
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
          {shortcut ? <Text style={styles.shortcut}>{shortcut}</Text> : null}
        </Pressable>
      </RovingFocusGroup.RovingFocusItem>
    )
  },
)

MenubarItemBase.displayName = "MenubarItemBase"

export type MenubarItemProps = Omit<
  MenubarItemBaseProps,
  "role" | "ariaChecked" | "indicator"
> & {
  indicator?: never
}

export const MenubarItem = React.forwardRef<View, MenubarItemProps>(
  (props, ref) => {
    return <MenubarItemBase ref={ref} role="menuitem" {...props} />
  },
)

MenubarItem.displayName = "MenubarItem"

export type MenubarCheckboxItemProps = Omit<
  MenubarItemBaseProps,
  "role" | "ariaChecked"
> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const MenubarCheckboxItem = React.forwardRef<
  View,
  MenubarCheckboxItemProps
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
      <MenubarItemBase
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

MenubarCheckboxItem.displayName = "MenubarCheckboxItem"

type MenubarRadioGroupContextValue = {
  value?: string
  onValueChange?: (value: string) => void
}

const MenubarRadioGroupContext =
  React.createContext<MenubarRadioGroupContextValue | null>(null)

export type MenubarRadioGroupProps = ViewProps & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

export const MenubarRadioGroup = React.forwardRef<View, MenubarRadioGroupProps>(
  ({ value: valueProp, defaultValue, onValueChange, ...props }, ref) => {
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
      <MenubarRadioGroupContext.Provider
        value={{ value: currentValue, onValueChange: handleValueChange }}
      >
        <View ref={ref} {...props} />
      </MenubarRadioGroupContext.Provider>
    )
  },
)

MenubarRadioGroup.displayName = "MenubarRadioGroup"

export type MenubarRadioItemProps = Omit<
  MenubarItemBaseProps,
  "role" | "ariaChecked"
> & {
  value: string
}

export const MenubarRadioItem = React.forwardRef<View, MenubarRadioItemProps>(
  ({ value, onPress, closeOnSelect = true, ...props }, ref) => {
    const context = React.useContext(MenubarRadioGroupContext)
    if (!context) {
      throw new Error("MenubarRadioItem must be used within MenubarRadioGroup")
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
      <MenubarItemBase
        ref={ref}
        value={value}
        role="menuitemradio"
        ariaChecked={checked}
        closeOnSelect={closeOnSelect}
        indicator={
          checked ? (
            <Circle
              size={10}
              fill={theme.colors.accentForeground}
              color={theme.colors.accentForeground}
            />
          ) : null
        }
        onPress={handlePress}
        {...props}
      />
    )
  },
)

MenubarRadioItem.displayName = "MenubarRadioItem"

export type MenubarLabelProps = TextProps & {
  style?: StyleProp<TextStyle>
}

export const MenubarLabel = React.forwardRef<Text, MenubarLabelProps>(
  ({ style, ...props }, ref) => {
    return <Text ref={ref} style={[styles.label, style]} {...props} />
  },
)

MenubarLabel.displayName = "MenubarLabel"

export type MenubarSeparatorProps = ViewProps & {
  style?: StyleProp<ViewStyle>
}

export const MenubarSeparator = React.forwardRef<View, MenubarSeparatorProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.separator, style]} {...props} />
  },
)

MenubarSeparator.displayName = "MenubarSeparator"

export type MenubarGroupProps = ViewProps

export const MenubarGroup = React.forwardRef<View, MenubarGroupProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.group, style]} {...props} />
  },
)

MenubarGroup.displayName = "MenubarGroup"

export type MenubarShortcutProps = TextProps & {
  style?: StyleProp<TextStyle>
}

export const MenubarShortcut = React.forwardRef<Text, MenubarShortcutProps>(
  ({ style, ...props }, ref) => {
    return <Text ref={ref} style={[styles.shortcut, style]} {...props} />
  },
)

MenubarShortcut.displayName = "MenubarShortcut"

const styles = StyleSheet.create((theme) => ({
  menubar: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[1],
    padding: theme.spacing[1],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.popover,
  },
  trigger: {
    minHeight: theme.spacing[8],
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    variants: {
      open: {
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
  triggerPressed: {
    backgroundColor: theme.colors.muted,
  },
  triggerText: {
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    color: theme.colors.foreground,
  },
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
