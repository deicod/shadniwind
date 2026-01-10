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
  type ViewStyle,
  useWindowDimensions,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"
import { composeEventHandlers } from "../primitives/press/index.js"

type SidebarSide = "left" | "right"
type SidebarVariant = "sidebar" | "floating"
type SidebarCollapsible = "none" | "icon" | "offcanvas"

type SidebarContextValue = {
  side: SidebarSide
  variant: SidebarVariant
  collapsible: SidebarCollapsible
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  toggleCollapsed: () => void
  open: boolean
  setOpen: (open: boolean) => void
  toggleOpen: () => void
  expandedWidth: number
  collapsedWidth: number
  isMobile: boolean
  isOffcanvas: boolean
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("Sidebar components must be used within SidebarProvider")
  }
  return context
}

export type SidebarProviderProps = {
  children: React.ReactNode
  side?: SidebarSide
  variant?: SidebarVariant
  collapsible?: SidebarCollapsible
  expandedWidth?: number
  collapsedWidth?: number
  collapseBreakpoint?: number
  defaultCollapsed?: boolean
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * Sidebar provider for layout and responsive behavior.
 *
 * Uses a breakpoint to switch into off-canvas mode for smaller screens.
 */
export function SidebarProvider({
  children,
  side = "left",
  variant = "sidebar",
  collapsible = "icon",
  expandedWidth = 280,
  collapsedWidth = 72,
  collapseBreakpoint = 768,
  defaultCollapsed = false,
  collapsed: collapsedProp,
  onCollapsedChange,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
}: SidebarProviderProps) {
  const { width } = useWindowDimensions()
  const isMobile = width <= collapseBreakpoint
  const isOffcanvas = isMobile || collapsible === "offcanvas"
  const canCollapse = collapsible === "icon" && !isOffcanvas

  const [uncontrolledCollapsed, setUncontrolledCollapsed] =
    React.useState(defaultCollapsed)
  const [uncontrolledOpen, setUncontrolledOpen] =
    React.useState(defaultOpen)

  const isCollapsedControlled = collapsedProp !== undefined
  const isOpenControlled = openProp !== undefined

  const collapsed = canCollapse
    ? isCollapsedControlled
      ? collapsedProp
      : uncontrolledCollapsed
    : false
  const open = isOffcanvas
    ? isOpenControlled
      ? openProp
      : uncontrolledOpen
    : true

  const setCollapsed = React.useCallback(
    (nextCollapsed: boolean) => {
      if (!canCollapse) return
      if (!isCollapsedControlled) {
        setUncontrolledCollapsed(nextCollapsed)
      }
      onCollapsedChange?.(nextCollapsed)
    },
    [canCollapse, isCollapsedControlled, onCollapsedChange],
  )

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isOpenControlled) {
        setUncontrolledOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isOpenControlled, onOpenChange],
  )

  const toggleCollapsed = React.useCallback(() => {
    if (!canCollapse) return
    setCollapsed(!collapsed)
  }, [canCollapse, collapsed, setCollapsed])

  const toggleOpen = React.useCallback(() => {
    if (!isOffcanvas) return
    setOpen(!open)
  }, [isOffcanvas, open, setOpen])

  return (
    <SidebarContext.Provider
      value={{
        side,
        variant,
        collapsible,
        collapsed,
        setCollapsed,
        toggleCollapsed,
        open,
        setOpen,
        toggleOpen,
        expandedWidth,
        collapsedWidth,
        isMobile,
        isOffcanvas,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export type SidebarProps = ViewProps & {
  scrim?: boolean
  scrimStyle?: StyleProp<ViewStyle>
}

export const Sidebar = React.forwardRef<View, SidebarProps>(
  ({ children, style, scrim = true, scrimStyle, ...props }, ref) => {
    const {
      side,
      variant,
      collapsed,
      expandedWidth,
      collapsedWidth,
      isOffcanvas,
      open,
      setOpen,
    } = useSidebar()

    const width = collapsed ? collapsedWidth : expandedWidth

    styles.useVariants({
      variant,
      side,
      collapsed: collapsed ? true : undefined,
      offcanvas: isOffcanvas ? true : undefined,
    })

    if (isOffcanvas && !open) return null

    const panel = (
      <View
        ref={ref}
        style={[
          styles.sidebar,
          isOffcanvas && styles.sidebarOffcanvas,
          side === "left" ? styles.sidebarLeft : styles.sidebarRight,
          { width },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    )

    if (!isOffcanvas) {
      return panel
    }

    return (
      <View pointerEvents="box-none" style={styles.offcanvasRoot}>
        {scrim ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close sidebar"
            onPress={() => setOpen(false)}
            style={[styles.scrim, scrimStyle]}
          />
        ) : null}
        {panel}
      </View>
    )
  },
)

Sidebar.displayName = "Sidebar"

export type SidebarInsetProps = ViewProps

export const SidebarInset = React.forwardRef<View, SidebarInsetProps>(
  ({ style, ...props }, ref) => {
    const {
      side,
      collapsed,
      expandedWidth,
      collapsedWidth,
      isOffcanvas,
    } = useSidebar()

    const insetWidth = isOffcanvas
      ? 0
      : collapsed
        ? collapsedWidth
        : expandedWidth

    const insetStyle: ViewStyle =
      side === "left" ? { marginLeft: insetWidth } : { marginRight: insetWidth }

    return <View ref={ref} style={[styles.inset, insetStyle, style]} {...props} />
  },
)

SidebarInset.displayName = "SidebarInset"

export type SidebarTriggerProps = PressableProps & {
  asChild?: boolean
}

export const SidebarTrigger = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  SidebarTriggerProps
>(({ asChild, children, disabled, style, onPress, ...props }, ref) => {
  const { collapsed, open, isOffcanvas, toggleCollapsed, toggleOpen } =
    useSidebar()
  const isDisabled = !!disabled
  const expanded = isOffcanvas ? open : !collapsed

  const handlePress = React.useCallback(
    (event: unknown) => {
      if (isDisabled) return
      if (isOffcanvas) {
        toggleOpen()
      } else {
        toggleCollapsed()
      }
      // @ts-expect-error - React Native event type
      onPress?.(event)
    },
    [isDisabled, isOffcanvas, onPress, toggleCollapsed, toggleOpen],
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
      role: Platform.OS === "web" ? "button" : undefined,
      "aria-expanded": Platform.OS === "web" ? expanded : undefined,
      accessibilityRole: "button",
      accessibilityState: {
        expanded,
        disabled: isDisabled,
      },
      disabled: isDisabled,
      ...props,
    })
  }

  return (
    <Pressable
      ref={ref}
      role={Platform.OS === "web" ? "button" : undefined}
      aria-expanded={Platform.OS === "web" ? expanded : undefined}
      accessibilityRole="button"
      accessibilityState={{
        expanded,
        disabled: isDisabled,
      }}
      disabled={isDisabled}
      onPress={handlePress}
      style={({ pressed }) =>
        [
          styles.trigger,
          pressed && !isDisabled && styles.triggerPressed,
          isDisabled && styles.triggerDisabled,
          typeof style === "function" ? style({ pressed }) : style,
          // biome-ignore lint/suspicious/noExplicitAny: Style array type assertion
        ] as any
      }
      {...props}
    >
      {children}
    </Pressable>
  )
})

SidebarTrigger.displayName = "SidebarTrigger"

export type SidebarRailProps = PressableProps

export const SidebarRail = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  SidebarRailProps
>(({ disabled, style, onPress, ...props }, ref) => {
  const { isOffcanvas, toggleCollapsed } = useSidebar()
  const isDisabled = !!disabled

  if (isOffcanvas) return null

  return (
    <Pressable
      ref={ref}
      role={Platform.OS === "web" ? "button" : undefined}
      accessibilityRole="button"
      accessibilityState={{
        disabled: isDisabled,
      }}
      disabled={isDisabled}
      onPress={(event) => {
        if (isDisabled) return
        toggleCollapsed()
        onPress?.(event)
      }}
      style={({ pressed }) =>
        [
          styles.rail,
          pressed && !isDisabled && styles.railPressed,
          isDisabled && styles.railDisabled,
          typeof style === "function" ? style({ pressed }) : style,
          // biome-ignore lint/suspicious/noExplicitAny: Style array type assertion
        ] as any
      }
      {...props}
    />
  )
})

SidebarRail.displayName = "SidebarRail"

export type SidebarHeaderProps = ViewProps

export const SidebarHeader = React.forwardRef<View, SidebarHeaderProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.header, style]} {...props} />
  },
)

SidebarHeader.displayName = "SidebarHeader"

export type SidebarContentProps = ViewProps

export const SidebarContent = React.forwardRef<View, SidebarContentProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.content, style]} {...props} />
  },
)

SidebarContent.displayName = "SidebarContent"

export type SidebarFooterProps = ViewProps

export const SidebarFooter = React.forwardRef<View, SidebarFooterProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.footer, style]} {...props} />
  },
)

SidebarFooter.displayName = "SidebarFooter"

export type SidebarSeparatorProps = ViewProps

export const SidebarSeparator = React.forwardRef<View, SidebarSeparatorProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.separator, style]} {...props} />
  },
)

SidebarSeparator.displayName = "SidebarSeparator"

export type SidebarGroupProps = ViewProps

export const SidebarGroup = React.forwardRef<View, SidebarGroupProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.group, style]} {...props} />
  },
)

SidebarGroup.displayName = "SidebarGroup"

export type SidebarGroupLabelProps = ViewProps & {
  hideWhenCollapsed?: boolean
}

export const SidebarGroupLabel = React.forwardRef<View, SidebarGroupLabelProps>(
  ({ hideWhenCollapsed = true, style, children, ...props }, ref) => {
    const { collapsed } = useSidebar()

    if (hideWhenCollapsed && collapsed) return null

    return (
      <View ref={ref} style={[styles.groupLabel, style]} {...props}>
        {typeof children === "string" || typeof children === "number" ? (
          <Text style={styles.groupLabelText}>{children}</Text>
        ) : (
          children
        )}
      </View>
    )
  },
)

SidebarGroupLabel.displayName = "SidebarGroupLabel"

export type SidebarGroupContentProps = ViewProps

export const SidebarGroupContent = React.forwardRef<
  View,
  SidebarGroupContentProps
>(({ style, ...props }, ref) => {
  return <View ref={ref} style={[styles.groupContent, style]} {...props} />
})

SidebarGroupContent.displayName = "SidebarGroupContent"

export type SidebarMenuProps = ViewProps

export const SidebarMenu = React.forwardRef<View, SidebarMenuProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.menu, style]} {...props} />
  },
)

SidebarMenu.displayName = "SidebarMenu"

export type SidebarMenuItemProps = ViewProps

export const SidebarMenuItem = React.forwardRef<View, SidebarMenuItemProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.menuItem, style]} {...props} />
  },
)

SidebarMenuItem.displayName = "SidebarMenuItem"

export type SidebarMenuButtonProps = PressableProps & {
  asChild?: boolean
  active?: boolean
  size?: "default" | "sm" | "lg"
  textStyle?: StyleProp<TextStyle>
}

export const SidebarMenuButton = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  SidebarMenuButtonProps
>(
  (
    {
      asChild,
      active = false,
      size = "default",
      textStyle,
      disabled,
      children,
      style,
      onPress,
      ...props
    },
    ref,
  ) => {
    const { collapsed } = useSidebar()
    const isDisabled = !!disabled

    styles.useVariants({
      active: active ? true : undefined,
      disabled: isDisabled,
      size: size === "default" ? undefined : size,
      collapsed: collapsed ? true : undefined,
    })

    const handlePress = React.useCallback(
      (event: unknown) => {
        if (isDisabled) return
        // @ts-expect-error - React Native event type
        onPress?.(event)
      },
      [isDisabled, onPress],
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
        role: Platform.OS === "web" ? "button" : undefined,
        "aria-current": Platform.OS === "web" && active ? "page" : undefined,
        accessibilityRole: "button",
        accessibilityState: {
          disabled: isDisabled,
          selected: active,
        },
        disabled: isDisabled,
        ...props,
      })
    }

    return (
      <Pressable
        ref={ref}
        role={Platform.OS === "web" ? "button" : undefined}
        aria-current={Platform.OS === "web" && active ? "page" : undefined}
        accessibilityRole="button"
        accessibilityState={{
          disabled: isDisabled,
          selected: active,
        }}
        disabled={isDisabled}
        onPress={handlePress}
        style={({ pressed }) =>
          [
            styles.menuButton,
            pressed && !isDisabled && styles.menuButtonPressed,
            typeof style === "function" ? style({ pressed }) : style,
            // biome-ignore lint/suspicious/noExplicitAny: Style array type assertion
          ] as any
        }
        {...props}
      >
        {typeof children === "string" || typeof children === "number" ? (
          <Text
            style={[
              styles.menuButtonText,
              size === "sm" && styles.menuButtonTextSm,
              size === "lg" && styles.menuButtonTextLg,
              active && styles.menuButtonTextActive,
              isDisabled && styles.menuButtonTextDisabled,
              textStyle,
            ]}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    )
  },
)

SidebarMenuButton.displayName = "SidebarMenuButton"

export type SidebarMenuSubProps = ViewProps

export const SidebarMenuSub = React.forwardRef<View, SidebarMenuSubProps>(
  ({ style, ...props }, ref) => {
    return <View ref={ref} style={[styles.menuSub, style]} {...props} />
  },
)

SidebarMenuSub.displayName = "SidebarMenuSub"

export type SidebarMenuSubItemProps = ViewProps

export const SidebarMenuSubItem = React.forwardRef<
  View,
  SidebarMenuSubItemProps
>(({ style, ...props }, ref) => {
  return <View ref={ref} style={[styles.menuSubItem, style]} {...props} />
})

SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

export type SidebarMenuSubButtonProps = PressableProps & {
  asChild?: boolean
  active?: boolean
  textStyle?: StyleProp<TextStyle>
}

export const SidebarMenuSubButton = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  SidebarMenuSubButtonProps
>(
  (
    {
      asChild,
      active = false,
      textStyle,
      disabled,
      children,
      style,
      onPress,
      ...props
    },
    ref,
  ) => {
    const isDisabled = !!disabled

    styles.useVariants({
      active: active ? true : undefined,
      disabled: isDisabled,
    })

    const handlePress = React.useCallback(
      (event: unknown) => {
        if (isDisabled) return
        // @ts-expect-error - React Native event type
        onPress?.(event)
      },
      [isDisabled, onPress],
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
        role: Platform.OS === "web" ? "button" : undefined,
        "aria-current": Platform.OS === "web" && active ? "page" : undefined,
        accessibilityRole: "button",
        accessibilityState: {
          disabled: isDisabled,
          selected: active,
        },
        disabled: isDisabled,
        ...props,
      })
    }

    return (
      <Pressable
        ref={ref}
        role={Platform.OS === "web" ? "button" : undefined}
        aria-current={Platform.OS === "web" && active ? "page" : undefined}
        accessibilityRole="button"
        accessibilityState={{
          disabled: isDisabled,
          selected: active,
        }}
        disabled={isDisabled}
        onPress={handlePress}
        style={({ pressed }) =>
          [
            styles.menuSubButton,
            pressed && !isDisabled && styles.menuSubButtonPressed,
            typeof style === "function" ? style({ pressed }) : style,
            // biome-ignore lint/suspicious/noExplicitAny: Style array type assertion
          ] as any
        }
        {...props}
      >
        {typeof children === "string" || typeof children === "number" ? (
          <Text
            style={[
              styles.menuSubButtonText,
              active && styles.menuSubButtonTextActive,
              isDisabled && styles.menuSubButtonTextDisabled,
              textStyle,
            ]}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    )
  },
)

SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

const styles = StyleSheet.create((theme) => ({
  sidebar: {
    height: "100%",
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    flexDirection: "column",
    variants: {
      variant: {
        sidebar: {},
        floating: {
          borderWidth: 1,
          borderRadius: theme.radius.lg,
          shadowColor: theme.colors.foreground,
          shadowOpacity: 0.08,
          shadowRadius: 10,
          elevation: 3,
        },
      },
      side: {
        left: {
          borderRightWidth: 1,
        },
        right: {
          borderLeftWidth: 1,
        },
      },
      offcanvas: {
        true: {
          position: "absolute",
          top: 0,
          bottom: 0,
          zIndex: 50,
        },
      },
    },
  },
  sidebarLeft: {
    left: 0,
  },
  sidebarRight: {
    right: 0,
  },
  sidebarOffcanvas: {
    backgroundColor: theme.colors.background,
  },
  offcanvasRoot: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
  },
  scrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  inset: {
    flex: 1,
    minHeight: 0,
    width: "100%",
  },
  trigger: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.radius.md,
  },
  triggerPressed: {
    opacity: 0.7,
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  rail: {
    width: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.border,
    alignSelf: "center",
  },
  railPressed: {
    opacity: 0.7,
  },
  railDisabled: {
    opacity: 0.4,
  },
  header: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[3],
    gap: theme.spacing[2],
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing[2],
    paddingBottom: theme.spacing[2],
    gap: theme.spacing[2],
  },
  footer: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[3],
    gap: theme.spacing[2],
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing[2],
  },
  group: {
    gap: theme.spacing[1],
  },
  groupLabel: {
    paddingHorizontal: theme.spacing[2],
  },
  groupLabelText: {
    fontSize: theme.typography.sizes.xs,
    lineHeight: theme.typography.lineHeights.xs,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: theme.colors.mutedForeground,
  },
  groupContent: {
    gap: theme.spacing[1],
  },
  menu: {
    gap: theme.spacing[1],
  },
  menuItem: {},
  menuButton: {
    minHeight: 40,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.md,
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
          opacity: 0.6,
        },
      },
      collapsed: {
        true: {
          justifyContent: "center",
          paddingHorizontal: theme.spacing[2],
        },
      },
      size: {
        sm: {
          minHeight: 32,
          paddingVertical: theme.spacing[1],
          paddingHorizontal: theme.spacing[2],
        },
        default: {},
        lg: {
          minHeight: 48,
          paddingVertical: theme.spacing[3],
          paddingHorizontal: theme.spacing[4],
        },
      },
    },
  },
  menuButtonPressed: {
    backgroundColor: theme.colors.muted,
  },
  menuButtonText: {
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    color: theme.colors.foreground,
  },
  menuButtonTextSm: {
    fontSize: theme.typography.sizes.xs,
    lineHeight: theme.typography.lineHeights.xs,
  },
  menuButtonTextLg: {
    fontSize: theme.typography.sizes.md,
    lineHeight: theme.typography.lineHeights.md,
  },
  menuButtonTextActive: {
    color: theme.colors.foreground,
  },
  menuButtonTextDisabled: {
    color: theme.colors.mutedForeground,
  },
  menuSub: {
    paddingLeft: theme.spacing[3],
    gap: theme.spacing[1],
  },
  menuSubItem: {},
  menuSubButton: {
    minHeight: 32,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.radius.md,
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
          opacity: 0.6,
        },
      },
    },
  },
  menuSubButtonPressed: {
    backgroundColor: theme.colors.muted,
  },
  menuSubButtonText: {
    fontSize: theme.typography.sizes.xs,
    lineHeight: theme.typography.lineHeights.xs,
    color: theme.colors.foreground,
  },
  menuSubButtonTextActive: {
    color: theme.colors.foreground,
  },
  menuSubButtonTextDisabled: {
    color: theme.colors.mutedForeground,
  },
}))
