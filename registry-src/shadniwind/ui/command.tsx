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
import * as RovingFocusGroup from "../primitives/roving-focus/index.js"

type CommandItemData = {
  value: string
  label: string
  disabled?: boolean
  order: number
}

type CommandFilter = (item: CommandItemData, query: string) => boolean

type CommandContextValue = {
  query: string
  setQuery: (value: string) => void
  shouldFilter: boolean
  filterItem: CommandFilter
  registerItem: (value: string, label: string, disabled?: boolean) => () => void
  filteredItems: CommandItemData[]
  activeValue?: string
  setActiveValue: (value?: string) => void
  listId: string
  inputId: string
  getItemId: (value: string) => string
  setItemAction: (value: string, action?: (value: string) => void) => void
  runItemAction: (value: string) => void
}

const CommandContext = React.createContext<CommandContextValue | undefined>(
  undefined,
)

function useCommand() {
  const context = React.useContext(CommandContext)
  if (!context) {
    throw new Error("Command components must be used within Command")
  }
  return context
}

export type CommandProps = ViewProps & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  shouldFilter?: boolean
  filter?: CommandFilter
}

export const Command = React.forwardRef<View, CommandProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      shouldFilter = true,
      filter,
      style,
      ...props
    },
    ref,
  ) => {
    const [query, setQuery] = React.useState(valueProp ?? defaultValue ?? "")
    const [activeValue, setActiveValue] = React.useState<string | undefined>(
      undefined,
    )
    const [itemsVersion, setItemsVersion] = React.useState(0)
    const itemsRef = React.useRef<Map<string, CommandItemData>>(new Map())
    const orderRef = React.useRef(0)
    const orderMapRef = React.useRef<Map<string, number>>(new Map())
    const itemActionRef = React.useRef<Map<string, (value: string) => void>>(
      new Map(),
    )
    const listId = React.useId()
    const inputId = React.useId()

    const isControlled = valueProp !== undefined
    const currentQuery = isControlled ? valueProp ?? "" : query

    const filterItem = React.useCallback<CommandFilter>(
      (item, search) => {
        if (!search) return true
        return item.label.toLowerCase().includes(search.toLowerCase())
      },
      [],
    )

    const activeFilter = filter ?? filterItem

    const items = React.useMemo(() => {
      const currentVersion = itemsVersion
      void currentVersion
      return Array.from(itemsRef.current.values()).sort(
        (a, b) => a.order - b.order,
      )
    }, [itemsVersion])

    const filteredItems = React.useMemo(() => {
      if (!shouldFilter) return items
      const search = currentQuery.trim()
      if (!search) return items
      return items.filter((item) => activeFilter(item, search))
    }, [activeFilter, currentQuery, items, shouldFilter])

    const registerItem = React.useCallback(
      (itemValue: string, label: string, itemDisabled?: boolean) => {
        const existingOrder = orderMapRef.current.get(itemValue)
        const order = existingOrder ?? orderRef.current++
        orderMapRef.current.set(itemValue, order)
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

    const getItemId = React.useCallback(
      (value: string) => `${listId}-item-${encodeURIComponent(value)}`,
      [listId],
    )

    const setItemAction = React.useCallback(
      (value: string, action?: (value: string) => void) => {
        if (action) {
          itemActionRef.current.set(value, action)
        } else {
          itemActionRef.current.delete(value)
        }
      },
      [],
    )

    const runItemAction = React.useCallback((value: string) => {
      itemActionRef.current.get(value)?.(value)
    }, [])

    const handleQueryChange = React.useCallback(
      (nextValue: string) => {
        if (!isControlled) {
          setQuery(nextValue)
        }
        onValueChange?.(nextValue)
      },
      [isControlled, onValueChange],
    )

    React.useEffect(() => {
      if (filteredItems.length === 0) {
        setActiveValue(undefined)
        return
      }
      if (activeValue && filteredItems.some((item) => item.value === activeValue)) {
        return
      }
      const firstEnabled = filteredItems.find((item) => !item.disabled)
      if (firstEnabled) {
        setActiveValue(firstEnabled.value)
      }
    }, [activeValue, filteredItems])

    return (
      <CommandContext.Provider
        value={{
          query: currentQuery,
          setQuery: handleQueryChange,
          shouldFilter,
          filterItem: activeFilter,
          registerItem,
          filteredItems,
          activeValue,
          setActiveValue,
          listId,
          inputId,
          getItemId,
          setItemAction,
          runItemAction,
        }}
      >
        <View ref={ref} style={[styles.container, style]} {...props} />
      </CommandContext.Provider>
    )
  },
)

Command.displayName = "Command"

export type CommandInputProps = Omit<
  TextInputProps,
  "value" | "defaultValue" | "onChangeText"
> & {
  onChangeText?: TextInputProps["onChangeText"]
  onKeyDown?: (event: unknown) => void
  style?: StyleProp<TextStyle>
}

export const CommandInput = React.forwardRef<TextInput, CommandInputProps>(
  (
    {
      onChangeText,
      onKeyDown,
      onFocus,
      onBlur,
      placeholderTextColor,
      style,
      ...props
    },
    ref,
  ) => {
    const {
      query,
      setQuery,
      listId,
      inputId,
      activeValue,
      setActiveValue,
      filteredItems,
      getItemId,
      runItemAction,
    } = useCommand()
    const { theme } = useUnistyles()
    const [isFocused, setIsFocused] = React.useState(false)

    styles.useVariants({
      focused: isFocused,
    })

    const handleChangeText = React.useCallback(
      (text: string) => {
        setQuery(text)
        onChangeText?.(text)
      },
      [onChangeText, setQuery],
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

    const handleKeyDown = React.useCallback(
      // biome-ignore lint/suspicious/noExplicitAny: Web keyboard event type
      (event: any) => {
        if (Platform.OS !== "web") return
        if (event.key === "ArrowDown") {
          event.preventDefault()
          const nextValue = getNextActiveValue("next")
          if (nextValue) {
            setActiveValue(nextValue)
          }
        } else if (event.key === "ArrowUp") {
          event.preventDefault()
          const nextValue = getNextActiveValue("prev")
          if (nextValue) {
            setActiveValue(nextValue)
          }
        } else if (event.key === "Enter") {
          if (activeValue) {
            event.preventDefault()
            runItemAction(activeValue)
          }
        }
        onKeyDown?.(event)
      },
      [activeValue, getNextActiveValue, onKeyDown, runItemAction, setActiveValue],
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

    const activeDescendantId =
      Platform.OS === "web" && activeValue ? getItemId(activeValue) : undefined

    return (
      <TextInput
        ref={ref}
        value={query}
        placeholderTextColor={
          placeholderTextColor ?? theme.colors.mutedForeground
        }
        role={Platform.OS === "web" ? "searchbox" : undefined}
        aria-controls={Platform.OS === "web" ? listId : undefined}
        aria-activedescendant={
          Platform.OS === "web" ? activeDescendantId : undefined
        }
        id={Platform.OS === "web" ? inputId : undefined}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        // @ts-expect-error - onKeyDown is web-only
        onKeyDown={Platform.OS === "web" ? handleKeyDown : undefined}
        style={[styles.input, style]}
        {...props}
      />
    )
  },
)

CommandInput.displayName = "CommandInput"

export type CommandListProps = ViewProps & {
  scrollViewProps?: ScrollViewProps
}

export const CommandList = React.forwardRef<View, CommandListProps>(
  ({ children, style, scrollViewProps, ...props }, ref) => {
    const { listId, activeValue, setActiveValue } = useCommand()

    return (
      <View
        ref={ref}
        // @ts-expect-error - web-only role
        role={Platform.OS === "web" ? "listbox" : undefined}
        id={Platform.OS === "web" ? listId : undefined}
        style={[styles.list, style]}
        {...props}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          {...scrollViewProps}
          contentContainerStyle={[
            styles.listContent,
            scrollViewProps?.contentContainerStyle,
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
    )
  },
)

CommandList.displayName = "CommandList"

export type CommandItemProps = Omit<PressableProps, "children"> & {
  children?: React.ReactNode
  value: string
  textValue?: string
  disabled?: boolean
  onSelect?: (value: string) => void
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

export const CommandItem = React.forwardRef<View, CommandItemProps>(
  (
    { value, textValue, disabled, children, onSelect, onPress, style, ...props },
    ref,
  ) => {
    const {
      query,
      shouldFilter,
      filterItem,
      registerItem,
      activeValue,
      setActiveValue,
      getItemId,
      setItemAction,
    } = useCommand()
    const isDisabled = !!disabled
    const label = textValue ?? resolveTextValue(children, value) ?? value
    const isActive = activeValue === value
    const search = query.trim()
    const isVisible =
      !shouldFilter ||
      !search ||
      filterItem({ value, label, disabled: isDisabled, order: 0 }, search)
    const itemId = Platform.OS === "web" ? getItemId(value) : undefined

    const variantStyles = styles.useVariants({
      active: isActive,
      disabled: isDisabled,
    })

    React.useEffect(() => {
      return registerItem(value, label, isDisabled)
    }, [isDisabled, label, registerItem, value])

    React.useEffect(() => {
      if (!onSelect || isDisabled) {
        setItemAction(value, undefined)
        return () => setItemAction(value, undefined)
      }

      const handler = (selectedValue: string) => {
        if (isDisabled) return
        onSelect(selectedValue)
      }
      setItemAction(value, handler)
      return () => setItemAction(value, undefined)
    }, [isDisabled, onSelect, setItemAction, value])

    const handlePress = React.useCallback(
      (event: unknown) => {
        if (isDisabled) return
        onSelect?.(value)
        // @ts-expect-error - React Native event type
        onPress?.(event)
      },
      [isDisabled, onPress, onSelect, value],
    )

    const handleHoverIn = React.useCallback(() => {
      if (isDisabled) return
      setActiveValue(value)
    }, [isDisabled, setActiveValue, value])

    const handleFocus = React.useCallback(() => {
      if (isDisabled) return
      setActiveValue(value)
    }, [isDisabled, setActiveValue, value])

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

    if (!isVisible) return null

    return (
      <RovingFocusGroup.RovingFocusItem value={value} disabled={isDisabled} asChild>
        <Pressable
          ref={ref}
          role={Platform.OS === "web" ? "option" : undefined}
          aria-disabled={Platform.OS === "web" ? isDisabled : undefined}
          aria-selected={Platform.OS === "web" ? isActive : undefined}
          id={itemId}
          accessibilityRole="button"
          accessibilityState={{ disabled: isDisabled, selected: isActive }}
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

CommandItem.displayName = "CommandItem"

export type CommandEmptyProps = TextProps & {
  style?: StyleProp<TextStyle>
}

export const CommandEmpty = React.forwardRef<Text, CommandEmptyProps>(
  ({ style, children, ...props }, ref) => {
    const { filteredItems } = useCommand()
    if (filteredItems.length > 0) return null
    return (
      <Text ref={ref} style={[styles.empty, style]} {...props}>
        {children}
      </Text>
    )
  },
)

CommandEmpty.displayName = "CommandEmpty"

export type CommandGroupProps = ViewProps

export const CommandGroup = React.forwardRef<View, CommandGroupProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.group, style]} {...props} />
  },
)

CommandGroup.displayName = "CommandGroup"

export type CommandSeparatorProps = ViewProps & {
  style?: StyleProp<ViewStyle>
}

export const CommandSeparator = React.forwardRef<View, CommandSeparatorProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.separator, style]} {...props} />
  },
)

CommandSeparator.displayName = "CommandSeparator"

export type CommandShortcutProps = TextProps & {
  style?: StyleProp<TextStyle>
}

export const CommandShortcut = React.forwardRef<Text, CommandShortcutProps>(
  ({ style, ...props }, ref) => {
    return <Text ref={ref} style={[styles.shortcut, style]} {...props} />
  },
)

CommandShortcut.displayName = "CommandShortcut"

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.popover,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  input: {
    height: theme.spacing[10],
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: theme.spacing[3],
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    color: theme.colors.foreground,
    variants: {
      focused: {
        true: {
          borderBottomColor: theme.colors.ring,
        },
      },
    },
  },
  list: {
    maxHeight: 320,
  },
  listContent: {
    paddingVertical: theme.spacing[2],
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
  itemText: {
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    color: theme.colors.popoverForeground,
  },
  empty: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[3],
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.mutedForeground,
  },
  group: {
    paddingVertical: theme.spacing[1],
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing[1],
  },
  shortcut: {
    marginLeft: "auto",
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.mutedForeground,
  },
}))
