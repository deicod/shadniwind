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
import { Check, ChevronDown } from "lucide-react-native"
import { FocusScope } from "../primitives/focus/index.js"
import { DismissLayer } from "../primitives/overlay/index.js"
import { Portal } from "../primitives/portal/index.js"
import {
  type Placement,
  usePositioning,
} from "../primitives/positioning/index.js"
import { composeEventHandlers } from "../primitives/press/index.js"
import * as RovingFocusGroup from "../primitives/roving-focus/index.js"

const TYPEAHEAD_RESET_MS = 500

type SelectItemData = {
  value: string
  label: string
  disabled?: boolean
  order: number
}

type SelectContextValue = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value?: string
  onValueChange: (value: string) => void
  disabled?: boolean
  modal: boolean
  triggerRef: React.RefObject<View | null>
  contentRef: React.RefObject<View | null>
  registerItem: (value: string, label: string, disabled?: boolean) => () => void
  items: SelectItemData[]
  selectedLabel?: string
  focusValue?: string
  setFocusValue: (value: string) => void
  contentId: string
  triggerId: string
}

const SelectContext = React.createContext<SelectContextValue | undefined>(
  undefined,
)

function useSelect() {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be used within Select")
  }
  return context
}

export type SelectProps = {
  children: React.ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  modal?: boolean
}

export function Select({
  children,
  value: valueProp,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  modal = true,
}: SelectProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [value, setValue] = React.useState<string | undefined>(
    valueProp ?? defaultValue,
  )
  const triggerRef = React.useRef<View>(null)
  const contentRef = React.useRef<View>(null)
  const [itemsVersion, setItemsVersion] = React.useState(0)
  const [focusValue, setFocusValue] = React.useState<string | undefined>(
    valueProp ?? defaultValue,
  )
  const itemsRef = React.useRef<Map<string, SelectItemData>>(new Map())
  const labelMapRef = React.useRef<Map<string, string>>(new Map())
  const orderRef = React.useRef(0)
  const orderMapRef = React.useRef<Map<string, number>>(new Map())
  const contentId = React.useId()
  const triggerId = React.useId()

  const isControlledValue = valueProp !== undefined
  const currentValue = isControlledValue ? valueProp : value

  const isControlledOpen = openProp !== undefined
  const currentOpen = isControlledOpen ? openProp : open

  const items = React.useMemo(() => {
    const currentVersion = itemsVersion
    void currentVersion
    return Array.from(itemsRef.current.values()).sort(
      (a, b) => a.order - b.order,
    )
  }, [itemsVersion])

  const selectedLabel = React.useMemo(() => {
    if (currentValue === undefined) return undefined
    return (
      items.find((item) => item.value === currentValue)?.label ??
      labelMapRef.current.get(currentValue)
    )
  }, [currentValue, items])

  const registerItem = React.useCallback(
    (itemValue: string, label: string, itemDisabled?: boolean) => {
      const existingOrder = orderMapRef.current.get(itemValue)
      const order = existingOrder ?? orderRef.current++
      orderMapRef.current.set(itemValue, order)
      labelMapRef.current.set(itemValue, label)
      itemsRef.current.set(itemValue, {
        value: itemValue,
        label,
        disabled: itemDisabled,
        order,
      })
      setItemsVersion((prev) => prev + 1)

      return () => {
        itemsRef.current.delete(itemValue)
        setItemsVersion((prev) => prev + 1)
      }
    },
    [],
  )

  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      if (disabled) return
      if (!isControlledValue) {
        setValue(nextValue)
      }
      onValueChange?.(nextValue)
      setFocusValue(nextValue)
    },
    [disabled, isControlledValue, onValueChange],
  )

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (disabled && nextOpen) return
      if (!isControlledOpen) {
        setOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [disabled, isControlledOpen, onOpenChange],
  )

  React.useEffect(() => {
    if (!currentOpen) return

    const selectedItem = items.find(
      (item) => item.value === currentValue && !item.disabled,
    )
    if (selectedItem) {
      setFocusValue(selectedItem.value)
      return
    }

    const firstEnabled = items.find((item) => !item.disabled)
    if (firstEnabled) {
      setFocusValue(firstEnabled.value)
    }
  }, [currentOpen, currentValue, items])

  React.useEffect(() => {
    if (currentValue !== undefined) {
      setFocusValue(currentValue)
    }
  }, [currentValue])

  return (
    <SelectContext.Provider
      value={{
        open: !!currentOpen,
        onOpenChange: handleOpenChange,
        value: currentValue,
        onValueChange: handleValueChange,
        disabled,
        modal,
        triggerRef,
        contentRef,
        registerItem,
        items,
        selectedLabel,
        focusValue,
        setFocusValue,
        contentId,
        triggerId,
      }}
    >
      {children}
    </SelectContext.Provider>
  )
}

export type SelectTriggerProps = Omit<PressableProps, "children"> & {
  children?: React.ReactNode
  asChild?: boolean
  showChevron?: boolean
  onKeyDown?: (event: unknown) => void
}

export const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  SelectTriggerProps
>(
  (
    {
      children,
      asChild,
      showChevron = true,
      onPress,
      onFocus,
      onBlur,
      onKeyDown,
      disabled,
      style,
      ...props
    },
    ref,
  ) => {
  const { open, onOpenChange, disabled: selectDisabled, triggerRef, contentId } =
    useSelect()
  const { theme } = useUnistyles()
  const isDisabled = !!(disabled || selectDisabled)
  const [isFocused, setIsFocused] = React.useState(false)

  const variantStyles = styles.useVariants({
    focused: isFocused,
    disabled: isDisabled,
  })

  const handlePress = React.useCallback(
    (event: unknown) => {
      if (isDisabled) return
      onOpenChange(!open)
      // @ts-expect-error - React Native event type
      onPress?.(event)
    },
    [isDisabled, onOpenChange, open, onPress],
  )

  const handleKeyDown = React.useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: Web-only keyboard event type
    (event: any) => {
      if (Platform.OS !== "web" || isDisabled) return
      if (event.key === " " || event.key === "Enter" || event.key === "ArrowDown") {
        event.preventDefault()
        onOpenChange(true)
      }
      onKeyDown?.(event)
    },
    [isDisabled, onKeyDown, onOpenChange],
  )

  const handleFocus = React.useCallback(
    (event: unknown) => {
      setIsFocused(true)
      // @ts-expect-error - React Native event type
      onFocus?.(event)
    },
    [onFocus],
  )

  const handleBlur = React.useCallback(
    (event: unknown) => {
      setIsFocused(false)
      // @ts-expect-error - React Native event type
      onBlur?.(event)
    },
    [onBlur],
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

  const content = (
    <Pressable
      ref={triggerRef}
      role={Platform.OS === "web" ? "combobox" : undefined}
      aria-expanded={Platform.OS === "web" ? open : undefined}
      aria-controls={Platform.OS === "web" ? contentId : undefined}
      accessibilityRole="button"
      accessibilityState={{ expanded: open, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={handlePress}
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
      <View style={styles.triggerContent}>{children}</View>
      {showChevron && (
        <View style={[styles.icon, open && styles.iconOpen]}>
          <ChevronDown size={18} color={theme.colors.mutedForeground} />
        </View>
      )}
    </Pressable>
  )

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onPress?: (event: unknown) => void
      onKeyDown?: (event: unknown) => void
      onFocus?: (event: unknown) => void
      onBlur?: (event: unknown) => void
    }>
    const childOnPress = isDisabled ? undefined : child.props.onPress
    const childOnKeyDown = child.props.onKeyDown
    const childOnFocus = child.props.onFocus
    const childOnBlur = child.props.onBlur
    // biome-ignore lint/suspicious/noExplicitAny: Cloning logic
    return React.cloneElement(child as React.ReactElement<any>, {
      ref: triggerRef,
      onPress: composeEventHandlers(childOnPress, handlePress),
      onKeyDown:
        Platform.OS === "web"
          ? composeEventHandlers(childOnKeyDown, handleKeyDown)
          : childOnKeyDown,
      onFocus: composeEventHandlers(childOnFocus, handleFocus),
      onBlur: composeEventHandlers(childOnBlur, handleBlur),
      role: Platform.OS === "web" ? "combobox" : undefined,
      "aria-expanded": Platform.OS === "web" ? open : undefined,
      "aria-controls": Platform.OS === "web" ? contentId : undefined,
      accessibilityRole: "button",
      accessibilityState: {
        expanded: open,
        disabled: isDisabled,
      },
      disabled: isDisabled,
      ...props,
    })
  }

  return content
  },
)

SelectTrigger.displayName = "SelectTrigger"

export type SelectValueProps = TextProps & {
  placeholder?: string
}

export const SelectValue = React.forwardRef<Text, SelectValueProps>(
  ({ placeholder = "Select an option", style, children, ...props }, ref) => {
    const { selectedLabel } = useSelect()
    const hasCustomChildren = children !== undefined && children !== null
    const displayValue = hasCustomChildren ? children : selectedLabel
    const isPlaceholder = displayValue === undefined || displayValue === null

    return (
      <Text
        ref={ref}
        style={[
          styles.value,
          isPlaceholder && styles.valuePlaceholder,
          style,
        ]}
        {...props}
      >
        {isPlaceholder ? placeholder : displayValue}
      </Text>
    )
  },
)

SelectValue.displayName = "SelectValue"

export type SelectContentProps = ViewProps & {
  side?: Placement
  sideOffset?: number
  align?: "start" | "center" | "end"
  alignOffset?: number
  avoidCollisions?: boolean
  dismissable?: boolean
  onDismiss?: () => void
  viewportProps?: ScrollViewProps
}

export const SelectContent = React.forwardRef<View, SelectContentProps>(
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
      items,
      focusValue,
      setFocusValue,
      contentId,
    } = useSelect()

    const listRef = React.useRef<View>(null)
    const searchRef = React.useRef("")
    const lastTypeRef = React.useRef(0)
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

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

    const focusItemByValue = React.useCallback(
      (itemValue: string | undefined) => {
        if (!itemValue || Platform.OS !== "web") return
        const listNode = listRef.current as unknown as HTMLElement | null
        if (!listNode) return
        const selector = `[data-roving-focus-item][data-roving-focus-value="${itemValue}"]`
        const item = listNode.querySelector(selector) as HTMLElement | null
        item?.focus()
      },
      [],
    )

    const handleTypeahead = React.useCallback(
      // biome-ignore lint/suspicious/noExplicitAny: Web-only keyboard event type
      (event: any) => {
        if (Platform.OS !== "web") return
        if (event.defaultPrevented) return
        if (event.metaKey || event.ctrlKey || event.altKey) return
        if (!event.key || event.key.length !== 1) return

        const now = Date.now()
        const nextSearch =
          now - lastTypeRef.current > TYPEAHEAD_RESET_MS
            ? event.key
            : `${searchRef.current}${event.key}`
        searchRef.current = nextSearch.toLowerCase()
        lastTypeRef.current = now

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          searchRef.current = ""
        }, TYPEAHEAD_RESET_MS)

        const match = items.find(
          (item) =>
            !item.disabled &&
            item.label.toLowerCase().startsWith(searchRef.current),
        )
        if (match) {
          setFocusValue(match.value)
          focusItemByValue(match.value)
        }
      },
      [focusItemByValue, items, setFocusValue],
    )

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [])

    React.useEffect(() => {
      if (!open) return
      if (Platform.OS !== "web") return
      const handle = requestAnimationFrame(() => {
        focusItemByValue(focusValue)
      })
      return () => cancelAnimationFrame(handle)
    }, [focusItemByValue, focusValue, open])

    if (!open) return null

    return (
      <Portal>
        <DismissLayer
          onDismiss={handleDismiss}
          dismissable={dismissable}
          scrim={true}
          scrimStyle={styles.overlay}
        >
          <FocusScope trapped={modal} loop={true} style={styles.container}>
            <View
              ref={setContentRef}
              // @ts-expect-error - web-only role
              role={Platform.OS === "web" ? "listbox" : undefined}
              id={Platform.OS === "web" ? contentId : undefined}
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
                {...viewportProps}
                contentContainerStyle={[
                  styles.viewport,
                  viewportProps?.contentContainerStyle,
                ]}
              >
                <RovingFocusGroup.RovingFocusGroup
                  ref={listRef}
                  orientation="vertical"
                  value={focusValue}
                  onValueChange={setFocusValue}
                  loop
                  // @ts-expect-error - onKeyDownCapture is web-only
                  onKeyDownCapture={Platform.OS === "web" ? handleTypeahead : undefined}
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

SelectContent.displayName = "SelectContent"

export type SelectItemProps = Omit<PressableProps, "children"> & {
  children?: React.ReactNode
  value: string
  textValue?: string
  disabled?: boolean
}

function resolveTextValue(children: React.ReactNode, fallback?: string) {
  if (typeof children === "string" || typeof children === "number") {
    return String(children)
  }
  if (Array.isArray(children)) {
    const text = children
      .map((child) =>
        typeof child === "string" || typeof child === "number"
          ? String(child)
          : "",
      )
      .join("")
    return text || fallback
  }
  return fallback
}

export const SelectItem = React.forwardRef<View, SelectItemProps>(
  ({ value, textValue, disabled, children, style, onPress, ...props }, ref) => {
    const { value: selectedValue, onValueChange, onOpenChange, registerItem, disabled: selectDisabled } =
      useSelect()
    const { theme } = useUnistyles()
    const isSelected = selectedValue === value
    const isDisabled = !!(disabled || selectDisabled)
    const label = textValue ?? resolveTextValue(children, value) ?? value

    const variantStyles = styles.useVariants({
      selected: isSelected,
      disabled: isDisabled,
    })

    React.useEffect(() => {
      return registerItem(value, label, isDisabled)
    }, [isDisabled, label, registerItem, value])

    const handlePress = React.useCallback(
      (event: unknown) => {
        if (isDisabled) return
        onValueChange(value)
        onOpenChange(false)
        // @ts-expect-error - React Native event type
        onPress?.(event)
      },
      [isDisabled, onOpenChange, onPress, onValueChange, value],
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
      <RovingFocusGroup.RovingFocusItem value={value} disabled={isDisabled} asChild>
        <Pressable
          ref={ref}
          role={Platform.OS === "web" ? "option" : undefined}
          aria-selected={Platform.OS === "web" ? isSelected : undefined}
          aria-disabled={Platform.OS === "web" ? isDisabled : undefined}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected, disabled: isDisabled }}
          disabled={isDisabled}
          onPress={handlePress}
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
          <View style={styles.itemIndicator}>
            {isSelected && (
              <Check size={16} color={theme.colors.accentForeground} />
            )}
          </View>
          {typeof children === "string" || typeof children === "number" ? (
            <Text style={styles.itemText}>{children}</Text>
          ) : (
            children
          )}
        </Pressable>
      </RovingFocusGroup.RovingFocusItem>
    )
  },
)

SelectItem.displayName = "SelectItem"

export type SelectGroupProps = ViewProps

export const SelectGroup = React.forwardRef<View, SelectGroupProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.group, style]} {...props} />
  },
)

SelectGroup.displayName = "SelectGroup"

export type SelectLabelProps = TextProps & {
  style?: StyleProp<TextStyle>
}

export const SelectLabel = React.forwardRef<Text, SelectLabelProps>(
  ({ style, ...props }, ref) => {
    return <Text ref={ref} style={[styles.label, style]} {...props} />
  },
)

SelectLabel.displayName = "SelectLabel"

export type SelectSeparatorProps = ViewProps & {
  style?: StyleProp<ViewStyle>
}

export const SelectSeparator = React.forwardRef<View, SelectSeparatorProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.separator, style]} {...props} />
  },
)

SelectSeparator.displayName = "SelectSeparator"

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  overlay: {
    backgroundColor: "transparent",
  },
  trigger: {
    height: theme.spacing[10],
    width: "100%",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.input,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing[2],
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
  triggerPressed: {
    opacity: 0.9,
  },
  triggerContent: {
    flex: 1,
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconOpen: {
    transform: [{ rotate: "180deg" }],
  },
  value: {
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    color: theme.colors.foreground,
  },
  valuePlaceholder: {
    color: theme.colors.mutedForeground,
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
      selected: {
        true: {
          backgroundColor: theme.colors.accent,
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
  itemText: {
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    color: theme.colors.popoverForeground,
  },
  group: {
    gap: theme.spacing[1],
    paddingVertical: theme.spacing[1],
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
}))
