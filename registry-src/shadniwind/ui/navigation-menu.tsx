import * as React from "react"
import {
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  Text,
  type TextStyle,
  View,
  type ViewProps,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"
import { DismissLayer } from "../primitives/overlay/index.js"
import { Portal } from "../primitives/portal/index.js"
import {
  type Placement,
  usePositioning,
} from "../primitives/positioning/index.js"
import { composeEventHandlers } from "../primitives/press/index.js"
import * as RovingFocusGroup from "../primitives/roving-focus/index.js"

type NavigationMenuContextValue = {
  openValue?: string
  setOpenValue: (value?: string) => void
  activeValue?: string
  setActiveValue: (value: string) => void
}

const NavigationMenuContext = React.createContext<
  NavigationMenuContextValue | undefined
>(undefined)

function useNavigationMenu() {
  const context = React.useContext(NavigationMenuContext)
  if (!context) {
    throw new Error("NavigationMenu components must be used within NavigationMenu")
  }
  return context
}

type NavigationMenuItemContextValue = {
  value: string
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<View | null>
  contentRef: React.RefObject<View | null>
  triggerId: string
  contentId: string
}

const NavigationMenuItemContext = React.createContext<
  NavigationMenuItemContextValue | undefined
>(undefined)

function useNavigationMenuItem() {
  const context = React.useContext(NavigationMenuItemContext)
  if (!context) {
    throw new Error(
      "NavigationMenu components must be used within NavigationMenuItem",
    )
  }
  return context
}

export type NavigationMenuProps = ViewProps & {
  value?: string
  defaultValue?: string
  onValueChange?: (value?: string) => void
}

/**
 * Navigation menu component with web-first interactions.
 *
 * Web: Supports roving focus across triggers and arrow-key open/close.
 * Native: Basic press-to-toggle behavior.
 *
 * Limitations:
 * - Content renders via portal and positioning (not a full Radix viewport).
 * - Native navigation patterns differ and may need app-specific wiring.
 */
export const NavigationMenu = React.forwardRef<View, NavigationMenuProps>(
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
      <NavigationMenuContext.Provider
        value={{
          openValue: currentOpenValue,
          setOpenValue: handleOpenValueChange,
          activeValue,
          setActiveValue: handleActiveValueChange,
        }}
      >
        <View
          ref={ref}
          role={Platform.OS === "web" ? "navigation" : undefined}
          style={[styles.root, style]}
          {...props}
        />
      </NavigationMenuContext.Provider>
    )
  },
)

NavigationMenu.displayName = "NavigationMenu"

export type NavigationMenuListProps = ViewProps

export const NavigationMenuList = React.forwardRef<View, NavigationMenuListProps>(
  ({ style, ...props }, ref) => {
    const { activeValue, setActiveValue } = useNavigationMenu()

    if (Platform.OS === "web") {
      return (
        <RovingFocusGroup.RovingFocusGroup
          ref={ref}
          orientation="horizontal"
          value={activeValue}
          onValueChange={setActiveValue}
          loop
          style={[styles.list, style]}
          {...props}
        />
      )
    }

    return <View ref={ref} style={[styles.list, style]} {...props} />
  },
)

NavigationMenuList.displayName = "NavigationMenuList"

export type NavigationMenuItemProps = ViewProps & {
  value?: string
}

export const NavigationMenuItem = React.forwardRef<
  View,
  NavigationMenuItemProps
>(({ value, style, ...props }, ref) => {
  const { openValue, setOpenValue, setActiveValue } = useNavigationMenu()
  const generatedId = React.useId()
  const itemValue = value ?? generatedId
  const open = openValue === itemValue
  const triggerRef = React.useRef<View>(null)
  const contentRef = React.useRef<View>(null)
  const triggerId = React.useId()
  const contentId = React.useId()

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      const nextValue = nextOpen ? itemValue : undefined
      setOpenValue(nextValue)
      if (nextOpen) {
        setActiveValue(itemValue)
      }
    },
    [itemValue, setActiveValue, setOpenValue],
  )

  return (
    <NavigationMenuItemContext.Provider
      value={{
        value: itemValue,
        open,
        setOpen,
        triggerRef,
        contentRef,
        triggerId,
        contentId,
      }}
    >
      <View ref={ref} style={[styles.item, style]} {...props} />
    </NavigationMenuItemContext.Provider>
  )
})

NavigationMenuItem.displayName = "NavigationMenuItem"

export type NavigationMenuTriggerProps = PressableProps & {
  asChild?: boolean
  onKeyDown?: (event: unknown) => void
}

export const NavigationMenuTrigger = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  NavigationMenuTriggerProps
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
    const { openValue, setActiveValue } = useNavigationMenu()
    const { open, setOpen, triggerRef, triggerId, contentId, value } =
      useNavigationMenuItem()
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
        role: Platform.OS === "web" ? "button" : undefined,
        "aria-expanded": Platform.OS === "web" ? open : undefined,
        "aria-controls": Platform.OS === "web" ? contentId : undefined,
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
          role={Platform.OS === "web" ? "button" : undefined}
          aria-expanded={Platform.OS === "web" ? open : undefined}
          aria-controls={Platform.OS === "web" ? contentId : undefined}
          aria-haspopup={Platform.OS === "web" ? "menu" : undefined}
          accessibilityRole="button"
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

NavigationMenuTrigger.displayName = "NavigationMenuTrigger"

export type NavigationMenuContentProps = ViewProps & {
  side?: Placement
  sideOffset?: number
  align?: "start" | "center" | "end"
  alignOffset?: number
  avoidCollisions?: boolean
  dismissable?: boolean
  onDismiss?: () => void
}

export const NavigationMenuContent = React.forwardRef<
  View,
  NavigationMenuContentProps
>(
  (
    {
      children,
      side = "bottom",
      sideOffset = 8,
      align = "start",
      alignOffset = 0,
      avoidCollisions = true,
      dismissable = true,
      onDismiss,
      style,
      ...props
    },
    ref,
  ) => {
    const { open, setOpen, triggerRef, contentRef, triggerId, contentId } =
      useNavigationMenuItem()

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
              nativeID={contentId}
              role={Platform.OS === "web" ? "region" : undefined}
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
              {children}
            </View>
          </View>
        </DismissLayer>
      </Portal>
    )
  },
)

NavigationMenuContent.displayName = "NavigationMenuContent"

export type NavigationMenuLinkProps = PressableProps & {
  asChild?: boolean
  active?: boolean
  closeOnSelect?: boolean
  textStyle?: StyleProp<TextStyle>
}

export const NavigationMenuLink = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  NavigationMenuLinkProps
>(
  (
    {
      children,
      asChild,
      active = false,
      closeOnSelect = true,
      disabled,
      style,
      textStyle,
      onPress,
      ...props
    },
    ref,
  ) => {
    const menuItemContext = React.useContext(NavigationMenuItemContext)
    const isDisabled = !!disabled
    const variantStyles = styles.useVariants({
      active,
      disabled: isDisabled,
    })

    const handlePress = React.useCallback(
      (event: unknown) => {
        if (isDisabled) return
        // @ts-expect-error - React Native event type
        onPress?.(event)
        if (closeOnSelect && menuItemContext?.open) {
          menuItemContext.setOpen(false)
        }
      },
      [closeOnSelect, isDisabled, menuItemContext, onPress],
    )

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{
        onPress?: (event: unknown) => void
      }>
      const childOnPress = isDisabled ? undefined : child.props.onPress
      // biome-ignore lint/suspicious/noExplicitAny: Cloning logic
      return React.cloneElement(child as React.ReactElement<any>, {
        ref,
        onPress: composeEventHandlers(childOnPress, handlePress),
        role: Platform.OS === "web" ? "link" : undefined,
        accessibilityRole: "link",
        accessibilityState: {
          disabled: isDisabled,
        },
        disabled: isDisabled,
        ...props,
      })
    }

    return (
      <Pressable
        ref={ref}
        role={Platform.OS === "web" ? "link" : undefined}
        accessibilityRole="link"
        accessibilityState={{
          disabled: isDisabled,
        }}
        disabled={isDisabled}
        onPress={handlePress}
        style={({ pressed }) =>
          [
            styles.link,
            variantStyles,
            pressed && !isDisabled && styles.linkPressed,
            typeof style === "function" ? style({ pressed }) : style,
            // biome-ignore lint/suspicious/noExplicitAny: Complex style array with variants requires type assertion
          ] as any
        }
        {...props}
      >
        {typeof children === "string" || typeof children === "number" ? (
          <Text style={[styles.linkText, textStyle]}>{children}</Text>
        ) : (
          children
        )}
      </Pressable>
    )
  },
)

NavigationMenuLink.displayName = "NavigationMenuLink"

export type NavigationMenuViewportProps = ViewProps

export const NavigationMenuViewport = React.forwardRef<
  React.ComponentRef<typeof View>,
  NavigationMenuViewportProps
>(({ style, ...props }, ref) => {
  return <View ref={ref} style={[styles.viewport, style]} {...props} />
})

NavigationMenuViewport.displayName = "NavigationMenuViewport"

export type NavigationMenuIndicatorProps = ViewProps

export const NavigationMenuIndicator = React.forwardRef<
  React.ComponentRef<typeof View>,
  NavigationMenuIndicatorProps
>(({ style, ...props }, ref) => {
  return <View ref={ref} style={[styles.indicator, style]} {...props} />
})

NavigationMenuIndicator.displayName = "NavigationMenuIndicator"

const styles = StyleSheet.create((theme) => ({
  root: {
    position: "relative",
    width: "100%",
  },
  list: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[1],
  },
  item: {},
  trigger: {
    minHeight: theme.spacing[8],
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[1],
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
    minWidth: 220,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.popover,
    padding: theme.spacing[4],
    shadowColor: theme.colors.foreground,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  link: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.radius.md,
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
  linkPressed: {
    backgroundColor: theme.colors.muted,
  },
  linkText: {
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    color: theme.colors.foreground,
  },
  viewport: {
    marginTop: theme.spacing[2],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.popover,
    padding: theme.spacing[3],
  },
  indicator: {
    height: 2,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
}))
