import * as React from "react"
import { Platform, Pressable, Text, View, type ViewProps } from "react-native"
import { StyleSheet } from "react-native-unistyles"

export type PaginationProps = ViewProps & {
  /**
   * Current page number (1-indexed)
   */
  currentPage: number
  /**
   * Total number of pages
   */
  totalPages: number
  /**
   * Callback when page changes
   */
  onPageChange: (page: number) => void
  /**
   * Number of page buttons to show on each side of current page
   * @default 1
   */
  siblingCount?: number
  /**
   * Whether to show first/last page buttons
   * @default true
   */
  showEdges?: boolean
}

/**
 * Pagination component for navigating through pages of data.
 *
 * This is a presentational component - you must wire it to your data source,
 * router, or state management solution.
 *
 * @example
 * ```tsx
 * const [page, setPage] = useState(1)
 * <Pagination
 *   currentPage={page}
 *   totalPages={10}
 *   onPageChange={setPage}
 * />
 * ```
 */
export const Pagination = React.forwardRef<
  React.ComponentRef<typeof View>,
  PaginationProps
>(
  (
    {
      currentPage,
      totalPages,
      onPageChange,
      siblingCount = 1,
      showEdges = true,
      style,
      ...props
    },
    ref,
  ) => {
    const range = React.useMemo(() => {
      const pages: (number | "ellipsis")[] = []

      // Always show first page if showEdges
      if (showEdges && currentPage > siblingCount + 2) {
        pages.push(1)
        if (currentPage > siblingCount + 3) {
          pages.push("ellipsis")
        }
      }

      // Show pages around current page
      const start = Math.max(1, currentPage - siblingCount)
      const end = Math.min(totalPages, currentPage + siblingCount)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // Always show last page if showEdges
      if (showEdges && currentPage < totalPages - siblingCount - 1) {
        if (currentPage < totalPages - siblingCount - 2) {
          pages.push("ellipsis")
        }
        pages.push(totalPages)
      }

      return pages
    }, [currentPage, totalPages, siblingCount, showEdges])

    const canGoPrevious = currentPage > 1
    const canGoNext = currentPage < totalPages

    return (
      <View ref={ref} style={[styles.container, style]} {...props}>
        {/* Previous button */}
        <PaginationButton
          disabled={!canGoPrevious}
          onPress={() => onPageChange(currentPage - 1)}
          accessibilityLabel="Previous page"
        >
          <Text style={styles.buttonText}>‹</Text>
        </PaginationButton>

        {/* Page buttons */}
        {range.map((page, index) => {
          if (page === "ellipsis") {
            // Use the last page number before this ellipsis for stable key
            const prevPage = index > 0 ? range[index - 1] : 0
            return (
              <View key={`ellipsis-after-${prevPage}`} style={styles.ellipsis}>
                <Text style={styles.ellipsisText}>⋯</Text>
              </View>
            )
          }

          const isActive = page === currentPage

          return (
            <PaginationButton
              key={page}
              onPress={() => onPageChange(page)}
              active={isActive}
              accessibilityLabel={`Page ${page}`}
              accessibilityState={{
                selected: isActive,
              }}
            >
              <Text style={[styles.buttonText, isActive && styles.activeText]}>
                {page}
              </Text>
            </PaginationButton>
          )
        })}

        {/* Next button */}
        <PaginationButton
          disabled={!canGoNext}
          onPress={() => onPageChange(currentPage + 1)}
          accessibilityLabel="Next page"
        >
          <Text style={styles.buttonText}>›</Text>
        </PaginationButton>
      </View>
    )
  },
)

Pagination.displayName = "Pagination"

type PaginationButtonProps = {
  onPress: () => void
  disabled?: boolean
  active?: boolean
  children: React.ReactNode
  accessibilityLabel?: string
  accessibilityState?: {
    selected?: boolean
  }
}

function PaginationButton({
  onPress,
  disabled = false,
  active = false,
  children,
  accessibilityLabel,
  accessibilityState,
}: PaginationButtonProps) {
  const variantStyles = styles.useVariants({
    active,
    disabled,
  })

  return (
    <Pressable
      role={Platform.OS === "web" ? "button" : undefined}
      aria-label={Platform.OS === "web" ? accessibilityLabel : undefined}
      aria-current={Platform.OS === "web" && active ? "page" : undefined}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) =>
        [
          styles.button,
          variantStyles,
          pressed && !disabled && styles.buttonPressed,
          // biome-ignore lint/suspicious/noExplicitAny: Style array type assertion
        ] as any
      }
    >
      {children}
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  button: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    variants: {
      active: {
        true: {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        },
      },
      disabled: {
        true: {
          opacity: 0.5,
        },
      },
    },
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.foreground,
  },
  activeText: {
    color: theme.colors.primaryForeground,
  },
  ellipsis: {
    minWidth: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  ellipsisText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.mutedForeground,
  },
}))
