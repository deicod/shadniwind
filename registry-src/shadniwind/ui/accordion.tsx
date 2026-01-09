import * as React from "react"
import {
  Animated,
  Platform,
  Pressable,
  type PressableProps,
  Text,
  View,
  type ViewProps,
} from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"
// @ts-expect-error - lucide-react-native is a peer dependency
import { ChevronDown } from "lucide-react-native"
import * as RovingFocusGroup from "../primitives/roving-focus/index.js"

export type AccordionType = "single" | "multiple"

interface AccordionContextValue {
  type: AccordionType
  openValues: string[]
  onValueChange: (value: string) => void
  disabled?: boolean
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(
  undefined,
)

function useAccordion() {
  const context = React.useContext(AccordionContext)
  if (!context) {
    throw new Error("Accordion components must be used within Accordion")
  }
  return context
}

interface AccordionItemContextValue {
  value: string
  open: boolean
  onToggle: () => void
}

const AccordionItemContext = React.createContext<
  AccordionItemContextValue | undefined
>(undefined)

function useAccordionItem() {
  const context = React.useContext(AccordionItemContext)
  if (!context) {
    throw new Error(
      "AccordionItem components must be used within AccordionItem",
    )
  }
  return context
}

export interface AccordionProps extends ViewProps {
  type?: AccordionType
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  disabled?: boolean
}

export const Accordion = React.forwardRef<View, AccordionProps>(
  (
    {
      type = "single",
      value: valueProp,
      defaultValue,
      onValueChange,
      disabled = false,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    const defaultOpenValues = React.useMemo(() => {
      if (defaultValue === undefined) return []
      if (Array.isArray(defaultValue)) return defaultValue
      return [defaultValue]
    }, [defaultValue])

    const [openValues, setOpenValues] = React.useState<string[]>(
      valueProp !== undefined
        ? Array.isArray(valueProp)
          ? valueProp
          : [valueProp]
        : defaultOpenValues,
    )

    const isControlled = valueProp !== undefined
    const currentOpenValues = isControlled
      ? Array.isArray(valueProp)
        ? valueProp
        : [valueProp]
      : openValues

    // Track focused item for roving focus (separate from open state)
    const [focusedValue, setFocusedValue] = React.useState<string | undefined>(
      isControlled
        ? Array.isArray(currentOpenValues) && currentOpenValues.length > 0
          ? currentOpenValues[0]
          : undefined
        : Array.isArray(defaultOpenValues) && defaultOpenValues.length > 0
          ? defaultOpenValues[0]
          : undefined,
    )

    // Sync focused value when open values change (for single mode)
    React.useEffect(() => {
      if (type === "single" && currentOpenValues.length > 0) {
        setFocusedValue(currentOpenValues[0])
      }
    }, [currentOpenValues, type])

    const handleValueChange = React.useCallback(
      (newValue: string) => {
        if (disabled) return

        if (type === "single") {
          const isOpen = currentOpenValues.includes(newValue)
          const newValues = isOpen ? [] : [newValue]
          if (!isControlled) {
            setOpenValues(newValues)
          }
          onValueChange?.(newValues[0] ?? "")
        } else {
          const isOpen = currentOpenValues.includes(newValue)
          const newValues = isOpen
            ? currentOpenValues.filter((v) => v !== newValue)
            : [...currentOpenValues, newValue]
          if (!isControlled) {
            setOpenValues(newValues)
          }
          onValueChange?.(newValues)
        }
      },
      [type, currentOpenValues, disabled, isControlled, onValueChange],
    )

    return (
      <AccordionContext.Provider
        value={{
          type,
          openValues: currentOpenValues,
          onValueChange: handleValueChange,
          disabled,
        }}
      >
        <RovingFocusGroup.RovingFocusGroup
          orientation="vertical"
          value={focusedValue ?? ""}
          onValueChange={setFocusedValue}
          loop
          {...props}
          ref={ref}
          style={[styles.accordion, style]}
        >
          {children}
        </RovingFocusGroup.RovingFocusGroup>
      </AccordionContext.Provider>
    )
  },
)

Accordion.displayName = "Accordion"

export interface AccordionItemProps extends ViewProps {
  value: string
  disabled?: boolean
}

export const AccordionItem = React.forwardRef<View, AccordionItemProps>(
  ({ value, disabled = false, children, style, ...props }, ref) => {
    const context = React.useContext(AccordionContext)
    if (!context) {
      throw new Error("AccordionItem must be used within Accordion")
    }

    const open = context.openValues.includes(value)

    const handleToggle = React.useCallback(() => {
      if (disabled || context.disabled) return
      context.onValueChange(value)
    }, [value, disabled, context])

    return (
      <AccordionItemContext.Provider
        value={{ value, open, onToggle: handleToggle }}
      >
        <View
          ref={ref}
          style={[styles.item, disabled && styles.itemDisabled, style]}
          {...props}
        >
          {children}
        </View>
      </AccordionItemContext.Provider>
    )
  },
)

AccordionItem.displayName = "AccordionItem"

export interface AccordionTriggerProps extends PressableProps {
  showChevron?: boolean
}

export const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  AccordionTriggerProps
>(({ showChevron = true, children, style, ...props }, ref) => {
  const itemContext = useAccordionItem()
  const accordionContext = useAccordion()
  const isDisabled = props.disabled ?? accordionContext.disabled
  const { theme } = useUnistyles()

  const handlePress = () => {
    if (!isDisabled) {
      itemContext.onToggle()
    }
  }

  const content = (
    <Pressable
      ref={ref}
      role={Platform.OS === "web" ? "button" : undefined}
      aria-expanded={Platform.OS === "web" ? itemContext.open : undefined}
      aria-disabled={Platform.OS === "web" ? isDisabled : undefined}
      accessible={true}
      accessibilityRole="button"
      accessibilityState={{
        expanded: itemContext.open,
        disabled: isDisabled,
      }}
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) =>
        [
          styles.trigger,
          itemContext.open && styles.triggerOpen,
          isDisabled && styles.triggerDisabled,
          pressed && !isDisabled && styles.triggerPressed,
          typeof style === "function" ? style({ pressed }) : style,
          // biome-ignore lint/suspicious/noExplicitAny: Style array with conditional items requires type assertion
        ] as any
      }
      {...props}
    >
      <View style={styles.triggerContent}>
        {/* biome-ignore lint/complexity/noUselessFragments: Required for TypeScript type inference workaround */}
        <>
          {typeof children === "string" ? (
            <Text
              style={[
                styles.triggerText,
                itemContext.open && styles.triggerTextOpen,
                isDisabled && styles.triggerTextDisabled,
              ]}
            >
              {children}
            </Text>
          ) : (
            children
          )}
        </>
      </View>
      {showChevron && (
        <View style={[styles.chevron, itemContext.open && styles.chevronOpen]}>
          <ChevronDown
            size={20}
            color={
              isDisabled
                ? theme.colors.mutedForeground
                : theme.colors.foreground
            }
          />
        </View>
      )}
    </Pressable>
  )

  return (
    <RovingFocusGroup.RovingFocusItem
      value={itemContext.value}
      disabled={isDisabled}
      asChild
    >
      {content}
    </RovingFocusGroup.RovingFocusItem>
  )
})

AccordionTrigger.displayName = "AccordionTrigger"

export interface AccordionContentProps extends ViewProps {
  animated?: boolean
}

export const AccordionContent = React.forwardRef<View, AccordionContentProps>(
  ({ animated = true, children, style, ...props }, ref) => {
    const itemContext = useAccordionItem()

    const animatedHeight = React.useRef(
      new Animated.Value(itemContext.open ? 1 : 0),
    ).current
    const [contentHeight, setContentHeight] = React.useState<number>(0)

    React.useEffect(() => {
      Animated.timing(animatedHeight, {
        toValue: itemContext.open ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start()
    }, [itemContext.open, animatedHeight])

    const handleLayout = React.useCallback(
      // biome-ignore lint/suspicious/noExplicitAny: Layout event type
      (event: any) => {
        const { height } = event.nativeEvent.layout
        if (height > 0 && height !== contentHeight) {
          setContentHeight(height)
        }
      },
      [contentHeight],
    )

    const heightInterpolation = animatedHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, contentHeight],
    })

    const opacityInterpolation = animatedHeight.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.5, 1],
    })

    if (contentHeight === 0) {
      return (
        <View
          onLayout={handleLayout}
          style={[styles.contentMeasuring, style]}
          {...props}
        >
          <View>{children}</View>
        </View>
      )
    }

    if (!animated) {
      return itemContext.open ? (
        <View ref={ref} style={[styles.content, style]} {...props}>
          <View onLayout={handleLayout}>{children}</View>
        </View>
      ) : null
    }

    return (
      <Animated.View
        ref={ref}
        role={Platform.OS === "web" ? "region" : undefined}
        style={[
          styles.animatedContent,
          {
            height: heightInterpolation,
            opacity: opacityInterpolation,
          },
          style,
        ]}
        {...props}
      >
        <View onLayout={handleLayout}>{children}</View>
      </Animated.View>
    )
  },
)

AccordionContent.displayName = "AccordionContent"

const styles = StyleSheet.create((theme) => ({
  accordion: {
    gap: 0,
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    minHeight: 48,
    backgroundColor: theme.colors.background,
  },
  triggerOpen: {},
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerPressed: {
    opacity: 0.8,
  },
  triggerContent: {
    flex: 1,
  },
  triggerText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.foreground,
  },
  triggerTextOpen: {},
  triggerTextDisabled: {
    color: theme.colors.mutedForeground,
  },
  chevron: {
    marginLeft: 12,
    transform: [{ rotate: "0deg" }],
  },
  chevronOpen: {
    transform: [{ rotate: "180deg" }],
  },
  content: {
    overflow: "hidden",
  },
  contentMeasuring: {
    position: "absolute",
    opacity: 0,
    zIndex: -1,
  },
  animatedContent: {
    overflow: "hidden",
  },
}))
