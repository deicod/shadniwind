import * as React from "react"
import { Platform, Pressable, Text, View, type ViewProps } from "react-native"
import { StyleSheet } from "react-native-unistyles"

export type BreadcrumbItem = {
  /**
   * Display text for this breadcrumb item
   */
  label: string
  /**
   * Optional href for web. On native, use onPress instead.
   */
  href?: string
  /**
   * Whether this is the current/active page
   */
  current?: boolean
}

export type BreadcrumbProps = ViewProps & {
  /**
   * Array of breadcrumb items
   */
  items: BreadcrumbItem[]
  /**
   * Callback when a breadcrumb item is pressed
   * Consumer should handle navigation (e.g., router.push)
   */
  onItemPress?: (item: BreadcrumbItem, index: number) => void
  /**
   * Custom separator element
   * @default "/"
   */
  separator?: React.ReactNode
}

/**
 * Breadcrumb navigation component.
 *
 * **Important:** This is a presentational component. The `href` property is
 * metadata only - you MUST provide `onItemPress` to handle navigation.
 *
 * **Platform differences:**
 * - Web: Uses Pressable with role="link" and aria-current for accessibility
 * - Native: Uses Pressable with navigation left to consumer
 *
 * **Note:** True anchor links (with right-click/open-in-new-tab) are not
 * supported due to React Native limitations. Use onItemPress for all navigation.
 *
 * @example
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Products', href: '/products' },
 *     { label: 'Item', current: true }
 *   ]}
 *   onItemPress={(item) => {
 *     if (item.href) router.push(item.href)
 *   }}
 * />
 * ```
 */
export const Breadcrumb = React.forwardRef<
  React.ComponentRef<typeof View>,
  BreadcrumbProps
>(({ items, onItemPress, separator = "/", style, ...props }, ref) => {
  // Check if any item is explicitly marked as current
  const hasExplicitCurrent = items.some((item) => item.current === true)

  return (
    <View
      ref={ref}
      role={Platform.OS === "web" ? "navigation" : undefined}
      aria-label={Platform.OS === "web" ? "Breadcrumb" : undefined}
      style={[styles.container, style]}
      {...props}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        // Only use isLast fallback if no item is explicitly marked current
        const isCurrent = hasExplicitCurrent ? item.current === true : isLast
        // Use item properties for stable key
        const key = item.href || `${item.label}-${index}`

        return (
          <React.Fragment key={key}>
            {index > 0 && (
              <View style={styles.separator}>
                {typeof separator === "string" ? (
                  <Text style={styles.separatorText}>{separator}</Text>
                ) : (
                  separator
                )}
              </View>
            )}
            <BreadcrumbItem
              item={item}
              index={index}
              isCurrent={isCurrent}
              onPress={onItemPress}
            />
          </React.Fragment>
        )
      })}
    </View>
  )
})

Breadcrumb.displayName = "Breadcrumb"

type BreadcrumbItemProps = {
  item: BreadcrumbItem
  index: number
  isCurrent: boolean
  onPress?: (item: BreadcrumbItem, index: number) => void
}

function BreadcrumbItem({
  item,
  index,
  isCurrent,
  onPress,
}: BreadcrumbItemProps) {
  const handlePress = React.useCallback(() => {
    if (!isCurrent && onPress) {
      onPress(item, index)
    }
  }, [isCurrent, onPress, item, index])

  if (isCurrent) {
    return (
      <View
        role={Platform.OS === "web" ? "listitem" : undefined}
        aria-current={Platform.OS === "web" ? "page" : undefined}
        style={styles.itemCurrent}
      >
        <Text style={styles.textCurrent}>{item.label}</Text>
      </View>
    )
  }

  return (
    <Pressable
      role={Platform.OS === "web" ? "link" : undefined}
      aria-label={Platform.OS === "web" ? item.label : undefined}
      accessible={true}
      accessibilityRole="link"
      accessibilityLabel={item.label}
      onPress={handlePress}
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
    >
      <Text style={styles.text}>{item.label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  item: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  itemPressed: {
    opacity: 0.7,
  },
  itemCurrent: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  text: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.foreground,
  },
  textCurrent: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.mutedForeground,
  },
  separator: {
    paddingHorizontal: 4,
  },
  separatorText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.mutedForeground,
  },
}))
