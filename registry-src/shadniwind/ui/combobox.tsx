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
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"
// @ts-expect-error - lucide-react-native is a peer dependency
import { Check } from "lucide-react-native"
import { FocusScope } from "../primitives/focus/index.js"
import { DismissLayer } from "../primitives/overlay/index.js"
import { Portal } from "../primitives/portal/index.js"
import {
  type Placement,
  usePositioning,
} from "../primitives/positioning/index.js"
import * as RovingFocusGroup from "../primitives/roving-focus/index.js"

type ComboboxItemData = {
  value: string
  label: string
  disabled?: boolean
  order: number
}

type ComboboxFilter = (item: ComboboxItemData, query: string) => boolean

type ComboboxContextValue = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value?: string
  onValueChange: (value: string) => void
  inputValue: string
  setInputValue: (value: string) => void
  disabled?: boolean
  modal: boolean
  anchorRef: React.RefObject<View | null>
  contentRef: React.RefObject<View | null>
  registerItem: (value: string, label: string, disabled?: boolean) => () => void
  items: ComboboxItemData[]
  filteredItems: ComboboxItemData[]
  selectedLabel?: string
  activeValue?: string
  setActiveValue: (value?: string) => void
  listId: string
  inputId: string
  shouldFilter: boolean
  filterItem: ComboboxFilter
  getItemId: (value: string) => string
}

const ComboboxContext = React.createContext<ComboboxContextValue | undefined>(
  undefined,
)

function useCombobox() {
  const context = React.useContext(ComboboxContext)
  if (!context) {
    throw new Error("Combobox components must be used within Combobox")
  }
  return context
}

export type ComboboxProps = {
  children: React.ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  inputValue?: string
  defaultInputValue?: string
  onInputValueChange?: (value: string) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  modal?: boolean
  shouldFilter?: boolean
  filter?: ComboboxFilter
}

/**
 * Combobox component.
 *
 * Platform notes:
 * - Web: uses combobox/listbox roles with keyboard navigation; Enter selection
 *   is ignored while IME composition is active.
 * - Native: list renders in a portal overlay anchored to the input.
 */
export function Combobox({
  children,
  value: valueProp,
  defaultValue,
  onValueChange,
  inputValue: inputValueProp,
  defaultInputValue,
  onInputValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  modal = false,
  shouldFilter = true,
  filter,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [value, setValue] = React.useState<string | undefined>(
    valueProp ?? defaultValue,
  )
  const [inputValue, setInputValue] = React.useState(
    defaultInputValue ?? "",
  )
  const [activeValue, setActiveValue] = React.useState<string | undefined>(
    valueProp ?? defaultValue,
  )
  const [itemsVersion, setItemsVersion] = React.useState(0)
  const anchorRef = React.useRef<View>(null)
  const contentRef = React.useRef<View>(null)
  const itemsRef = React.useRef<Map<string, ComboboxItemData>>(new Map())
  const labelMapRef = React.useRef<Map<string, string>>(new Map())
  const orderRef = React.useRef(0)
  const orderMapRef = React.useRef<Map<string, number>>(new Map())
  const listId = React.useId()
  const inputId = React.useId()

  const isControlledValue = valueProp !== undefined
  const currentValue = isControlledValue ? valueProp : value
  const isControlledInput = inputValueProp !== undefined
  const currentInputValue = isControlledInput ? inputValueProp ?? "" : inputValue
  const isControlledOpen = openProp !== undefined
  const currentOpen = isControlledOpen ? openProp : open

  const items = React.useMemo(() => {
    const currentVersion = itemsVersion
    void currentVersion
    return Array.from(itemsRef.current.values()).sort(
      (a, b) => a.order - b.order,
    )
  }, [itemsVersion])

  const filterItem = React.useCallback<ComboboxFilter>(
    (item, query) => {
      if (!query) return true
      return item.label.toLowerCase().includes(query.toLowerCase())
    },
    [],
  )

  const activeFilter = filter ?? filterItem

  const filteredItems = React.useMemo(() => {
    if (!shouldFilter) return items
    const query = currentInputValue.trim()
    if (!query) return items
    return items.filter((item) => activeFilter(item, query))
  }, [activeFilter, currentInputValue, items, shouldFilter])

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

  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      if (disabled) return
      if (!isControlledValue) {
        setValue(nextValue)
      }
      onValueChange?.(nextValue)
      setActiveValue(nextValue)

      const nextLabel =
        itemsRef.current.get(nextValue)?.label ??
        labelMapRef.current.get(nextValue)
      if (nextLabel !== undefined) {
        if (!isControlledInput) {
          setInputValue(nextLabel)
        }
        onInputValueChange?.(nextLabel)
      }
    },
    [
      disabled,
      isControlledInput,
      isControlledValue,
      onInputValueChange,
      onValueChange,
    ],
  )

  const handleInputValueChange = React.useCallback(
    (nextValue: string) => {
      if (disabled) return
      if (!isControlledInput) {
        setInputValue(nextValue)
      }
      onInputValueChange?.(nextValue)
      if (!currentOpen) {
        handleOpenChange(true)
      }
    },
    [
      disabled,
      handleOpenChange,
      isControlledInput,
      currentOpen,
      onInputValueChange,
    ],
  )

  const getItemId = React.useCallback(
    (itemValue: string) => `${listId}-item-${encodeURIComponent(itemValue)}`,
    [listId],
  )

  React.useEffect(() => {
    if (isControlledInput) return
    if (selectedLabel === undefined) return
    setInputValue(selectedLabel)
  }, [isControlledInput, selectedLabel])

  React.useEffect(() => {
    if (!currentOpen) return
    if (filteredItems.length === 0) {
      setActiveValue(undefined)
      return
    }
    const selectedItem = filteredItems.find(
      (item) => item.value === currentValue && !item.disabled,
    )
    const firstEnabled =
      selectedItem ?? filteredItems.find((item) => !item.disabled)
    if (firstEnabled) {
      setActiveValue(firstEnabled.value)
    }
  }, [currentOpen, currentValue, filteredItems])

  return (
    <ComboboxContext.Provider
      value={{
        open: !!currentOpen,
        onOpenChange: handleOpenChange,
        value: currentValue,
        onValueChange: handleValueChange,
        inputValue: currentInputValue,
        setInputValue: handleInputValueChange,
        disabled,
        modal,
        anchorRef,
        contentRef,
        registerItem,
        items,
        filteredItems,
        selectedLabel,
        activeValue,
        setActiveValue,
        listId,
        inputId,
        shouldFilter,
        filterItem: activeFilter,
        getItemId,
      }}
    >
      {children}
    </ComboboxContext.Provider>
  )
}

export type ComboboxInputProps = Omit<
  TextInputProps,
  "value" | "defaultValue" | "onChangeText"
> & {
  onChangeText?: TextInputProps["onChangeText"]
  onKeyDown?: (event: unknown) => void
  onCompositionStart?: (event: unknown) => void
  onCompositionEnd?: (event: unknown) => void
  openOnFocus?: boolean
  style?: StyleProp<TextStyle>
}

export const ComboboxInput = React.forwardRef<TextInput, ComboboxInputProps>(
  (
    {
      onChangeText,
      onFocus,
      onBlur,
      onKeyDown,
      onCompositionStart,
      onCompositionEnd,
      openOnFocus = true,
      style,
      editable,
      placeholderTextColor,
      ...props
    },
    ref,
  ) => {
    const {
      open,
      onOpenChange,
      inputValue,
      setInputValue,
      onValueChange,
      disabled,
      anchorRef,
      listId,
      inputId,
      activeValue,
      setActiveValue,
      filteredItems,
      getItemId,
    } = useCombobox()
    const { theme } = useUnistyles()
    const [isFocused, setIsFocused] = React.useState(false)
    const isDisabled = disabled || editable === false
    const isComposingRef = React.useRef(false)

    styles.useVariants({
      focused: isFocused,
      disabled: isDisabled,
    })

    const setInputRef = React.useCallback(
      (node: TextInput | null) => {
        anchorRef.current = node as unknown as View | null
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ;(ref as { current: TextInput | null }).current = node
        }
      },
      [anchorRef, ref],
    )

    const getNextActiveValue = React.useCallback(
      (direction: "next" | "prev") => {
        const enabledItems = filteredItems.filter((item) => !item.disabled)
        if (enabledItems.length === 0) return undefined
        const currentIndex = enabledItems.findIndex(
          (item) => item.value === activeValue,
        )
        if (currentIndex === -1) {
          return direction === "next"
            ? enabledItems[0]?.value
            : enabledItems[enabledItems.length - 1]?.value
        }
        const nextIndex =
          direction === "next"
            ? Math.min(currentIndex + 1, enabledItems.length - 1)
            : Math.max(currentIndex - 1, 0)
        return enabledItems[nextIndex]?.value
      },
      [activeValue, filteredItems],
    )

    const handleChangeText = React.useCallback(
      (text: string) => {
        setInputValue(text)
        onChangeText?.(text)
      },
      [onChangeText, setInputValue],
    )

    const handleFocus = React.useCallback(
      (event: unknown) => {
        setIsFocused(true)
        if (!isDisabled && openOnFocus && !open) {
          onOpenChange(true)
        }
        // @ts-expect-error - React Native event type
        onFocus?.(event)
      },
      [isDisabled, onFocus, onOpenChange, open, openOnFocus],
    )

    const handleBlur = React.useCallback(
      (event: unknown) => {
        setIsFocused(false)
        // @ts-expect-error - React Native event type
        onBlur?.(event)
      },
      [onBlur],
    )

    const handleKeyDown = React.useCallback(
      // biome-ignore lint/suspicious/noExplicitAny: Web keyboard event type
      (event: any) => {
        if (Platform.OS !== "web") return
        if (isComposingRef.current) return

        if (event.key === "ArrowDown") {
          event.preventDefault()
          if (!open) {
            onOpenChange(true)
          }
          const nextValue = getNextActiveValue("next")
          if (nextValue) {
            setActiveValue(nextValue)
          }
        } else if (event.key === "ArrowUp") {
          event.preventDefault()
          if (!open) {
            onOpenChange(true)
          }
          const nextValue = getNextActiveValue("prev")
          if (nextValue) {
            setActiveValue(nextValue)
          }
        } else if (event.key === "Enter") {
          if (open && activeValue) {
            event.preventDefault()
            const activeItem = filteredItems.find(
              (item) => item.value === activeValue && !item.disabled,
            )
            if (activeItem) {
              onValueChange(activeValue)
              onOpenChange(false)
            }
          }
        } else if (event.key === "Escape") {
          if (open) {
            event.preventDefault()
            onOpenChange(false)
          }
        } else if (event.key === "Tab") {
          if (open) {
            onOpenChange(false)
          }
        }

        onKeyDown?.(event)
      },
      [
        activeValue,
        filteredItems,
        getNextActiveValue,
        onKeyDown,
        onOpenChange,
        onValueChange,
        open,
        setActiveValue,
      ],
    )

    const handleCompositionStart = React.useCallback(
      (event: unknown) => {
        isComposingRef.current = true
        onCompositionStart?.(event)
      },
      [onCompositionStart],
    )

    const handleCompositionEnd = React.useCallback(
      (event: unknown) => {
        isComposingRef.current = false
        onCompositionEnd?.(event)
      },
      [onCompositionEnd],
    )

    const activeDescendantId =
      activeValue && open ? getItemId(activeValue) : undefined

    return (
      <TextInput
        ref={setInputRef}
        value={inputValue}
        editable={isDisabled ? false : editable}
        placeholderTextColor={
          placeholderTextColor ?? theme.colors.mutedForeground
        }
        accessibilityState={{ disabled: isDisabled }}
        role={Platform.OS === "web" ? "combobox" : undefined}
        aria-expanded={Platform.OS === "web" ? open : undefined}
        aria-controls={Platform.OS === "web" ? listId : undefined}
        aria-autocomplete={Platform.OS === "web" ? "list" : undefined}
        aria-activedescendant={
          Platform.OS === "web" ? activeDescendantId : undefined
        }
        id={Platform.OS === "web" ? inputId : undefined}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        // @ts-expect-error - onKeyDown is web-only
        onKeyDown={Platform.OS === "web" ? handleKeyDown : undefined}
        onCompositionStart={
          Platform.OS === "web" ? handleCompositionStart : undefined
        }
        onCompositionEnd={
          Platform.OS === "web" ? handleCompositionEnd : undefined
        }
        style={[styles.input, style]}
        {...props}
      />
    )
  },
)

ComboboxInput.displayName = "ComboboxInput"

export type ComboboxContentProps = ViewProps & {
  side?: Placement
  sideOffset?: number
  align?: "start" | "center" | "end"
  alignOffset?: number
  avoidCollisions?: boolean
  dismissable?: boolean
  onDismiss?: () => void
  viewportProps?: ScrollViewProps
}

export const ComboboxContent = React.forwardRef<View, ComboboxContentProps>(
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
      anchorRef,
      contentRef,
      modal,
      activeValue,
      setActiveValue,
      listId,
    } = useCombobox()

    const actualPlacement = align === "center" ? side : `${side}-${align}`

    const { position, isPositioned } = usePositioning({
      anchorRef,
      contentRef,
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
          scrim={true}
          scrimStyle={styles.overlay}
        >
          <FocusScope trapped={modal} loop={true} style={styles.container}>
            <View
              ref={setContentRef}
              // @ts-expect-error - web-only role
              role={Platform.OS === "web" ? "listbox" : undefined}
              id={Platform.OS === "web" ? listId : undefined}
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

ComboboxContent.displayName = "ComboboxContent"

export type ComboboxItemProps = Omit<PressableProps, "children"> & {
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

export const ComboboxItem = React.forwardRef<View, ComboboxItemProps>(
  ({ value, textValue, disabled, children, style, onPress, ...props }, ref) => {
    const {
      value: selectedValue,
      onValueChange,
      onOpenChange,
      registerItem,
      disabled: comboboxDisabled,
      inputValue,
      shouldFilter,
      filterItem,
      activeValue,
      setActiveValue,
      getItemId,
    } = useCombobox()
    const { theme } = useUnistyles()
    const isSelected = selectedValue === value
    const isDisabled = !!(disabled || comboboxDisabled)
    const label = textValue ?? resolveTextValue(children, value) ?? value
    const isVisible =
      !shouldFilter ||
      filterItem(
        { value, label, disabled: isDisabled, order: 0 },
        inputValue.trim(),
      )
    const itemId = getItemId(value)

    const variantStyles = styles.useVariants({
      selected: isSelected,
      active: activeValue === value,
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

    const handleHoverIn = React.useCallback(() => {
      if (isDisabled) return
      setActiveValue(value)
    }, [isDisabled, setActiveValue, value])

    const handleFocus = React.useCallback(() => {
      if (isDisabled) return
      setActiveValue(value)
    }, [isDisabled, setActiveValue, value])

    if (!isVisible) return null

    return (
      <RovingFocusGroup.RovingFocusItem value={value} disabled={isDisabled} asChild>
        <Pressable
          ref={ref}
          role={Platform.OS === "web" ? "option" : undefined}
          aria-selected={Platform.OS === "web" ? isSelected : undefined}
          aria-disabled={Platform.OS === "web" ? isDisabled : undefined}
          id={Platform.OS === "web" ? itemId : undefined}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected, disabled: isDisabled }}
          disabled={isDisabled}
          onPress={handlePress}
          onHoverIn={handleHoverIn}
          onFocus={handleFocus}
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

ComboboxItem.displayName = "ComboboxItem"

export type ComboboxEmptyProps = TextProps & {
  style?: StyleProp<TextStyle>
}

export const ComboboxEmpty = React.forwardRef<Text, ComboboxEmptyProps>(
  ({ style, children, ...props }, ref) => {
    const { filteredItems, open } = useCombobox()
    if (!open || filteredItems.length > 0) return null
    return (
      <Text ref={ref} style={[styles.empty, style]} {...props}>
        {children}
      </Text>
    )
  },
)

ComboboxEmpty.displayName = "ComboboxEmpty"

export type ComboboxGroupProps = ViewProps

export const ComboboxGroup = React.forwardRef<View, ComboboxGroupProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.group, style]} {...props} />
  },
)

ComboboxGroup.displayName = "ComboboxGroup"

export type ComboboxLabelProps = TextProps & {
  style?: StyleProp<TextStyle>
}

export const ComboboxLabel = React.forwardRef<Text, ComboboxLabelProps>(
  ({ style, ...props }, ref) => {
    return <Text ref={ref} style={[styles.label, style]} {...props} />
  },
)

ComboboxLabel.displayName = "ComboboxLabel"

export type ComboboxSeparatorProps = ViewProps & {
  style?: StyleProp<ViewStyle>
}

export const ComboboxSeparator = React.forwardRef<View, ComboboxSeparatorProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.separator, style]} {...props} />
  },
)

ComboboxSeparator.displayName = "ComboboxSeparator"

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  overlay: {
    backgroundColor: "transparent",
  },
  input: {
    height: theme.spacing[10],
    width: "100%",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.input,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    color: theme.colors.foreground,
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
      active: {
        true: {
          backgroundColor: theme.colors.muted,
        },
      },
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
  empty: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    color: theme.colors.mutedForeground,
  },
}))
