import * as React from "react"
import {
  Platform,
  Pressable,
  Text,
  type StyleProp,
  type DimensionValue,
  View,
  type ViewProps,
  type ViewStyle,
  type TextStyle,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"

export type DataTableSort = {
  id: string
  desc?: boolean
}

export type DataTableColumn<T> = {
  id: string
  header?: React.ReactNode | ((column: DataTableColumn<T>) => React.ReactNode)
  accessor?: keyof T | ((row: T) => unknown)
  cell?: (row: T, rowIndex: number) => React.ReactNode
  sortable?: boolean
  sortAccessor?: (row: T) => unknown
  sortComparer?: (left: T, right: T) => number
  align?: "left" | "center" | "right"
  width?: DimensionValue
}

export type DataTableProps<T> = ViewProps & {
  data: T[]
  columns: DataTableColumn<T>[]
  getRowId?: (row: T) => string
  onRowPress?: (row: T, index: number) => void
  emptyMessage?: string
  loading?: boolean
  renderEmpty?: React.ReactNode
  renderLoading?: React.ReactNode
  sort?: DataTableSort
  defaultSort?: DataTableSort
  onSortChange?: (sort?: DataTableSort) => void
  rowStyle?: StyleProp<ViewStyle>
  headerCellStyle?: StyleProp<ViewStyle>
  cellStyle?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

type DataTableComponent = (<T>(
  props: DataTableProps<T> & React.RefAttributes<View>,
) => React.ReactElement | null) & {
  displayName?: string
}

function getSortValue<T>(column: DataTableColumn<T>, row: T) {
  if (column.sortAccessor) return column.sortAccessor(row)
  if (typeof column.accessor === "function") return column.accessor(row)
  if (typeof column.accessor === "string") {
    const record = row as Record<string, unknown>
    return record[column.accessor]
  }
  return undefined
}

function normalizeSortValue(value: unknown) {
  if (value === null || value === undefined) return null
  if (value instanceof Date) return value.getTime()
  if (typeof value === "boolean") return value ? 1 : 0
  if (typeof value === "number") return value
  if (typeof value === "string") return value.toLowerCase()
  return String(value).toLowerCase()
}

function resolveCellValue<T>(
  column: DataTableColumn<T>,
  row: T,
  rowIndex: number,
) {
  if (column.cell) return column.cell(row, rowIndex)
  if (typeof column.accessor === "function") {
    return coerceCellValue(column.accessor(row))
  }
  if (typeof column.accessor === "string") {
    const record = row as Record<string, unknown>
    return coerceCellValue(record[column.accessor])
  }
  return null
}

function coerceCellValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) return null
  if (React.isValidElement(value)) return value
  if (typeof value === "string" || typeof value === "number") return value
  if (typeof value === "boolean") return value ? "true" : "false"
  if (value instanceof Date) return value.toLocaleDateString()
  return String(value)
}

/**
 * DataTable component for rendering tabular data with optional sorting.
 *
 * **Web-first notes:**
 * - Header cells expose basic keyboard sorting (Enter/Space).
 * - ARIA roles are applied to reflect table structure on web.
 *
 * **Native limitations:**
 * - Rendered using View/Text instead of semantic table elements.
 * - Large datasets should use FlatList or virtualization.
 */
export const DataTable = React.forwardRef(function DataTable<T>(
  {
    data,
    columns,
    getRowId,
    onRowPress,
    emptyMessage = "No results.",
    loading = false,
    renderEmpty,
    renderLoading,
    sort: sortProp,
    defaultSort,
    onSortChange,
    rowStyle,
    headerCellStyle,
    cellStyle,
    textStyle,
    style,
    ...props
  }: DataTableProps<T>,
  ref: React.Ref<View>,
) {
    const [uncontrolledSort, setUncontrolledSort] =
      React.useState<DataTableSort | undefined>(defaultSort)
    const isSortControlled = sortProp !== undefined
    const currentSort = isSortControlled ? sortProp : uncontrolledSort

    const rowKeyMapRef = React.useRef(new WeakMap<object, string>())
    const rowKeyCounterRef = React.useRef(0)

    const handleSortChange = React.useCallback(
      (nextSort?: DataTableSort) => {
        if (!isSortControlled) {
          setUncontrolledSort(nextSort)
        }
        onSortChange?.(nextSort)
      },
      [isSortControlled, onSortChange],
    )

    const sortedData = React.useMemo(() => {
      if (!currentSort) return data
      const column = columns.find((col) => col.id === currentSort.id)
      if (!column) return data
      if (!column.sortable) return data

      if (column.sortComparer) {
        const sorted = data
          .map((row, index) => ({ row, index }))
          .sort((left, right) => {
            const result = column.sortComparer?.(left.row, right.row) ?? 0
            if (result !== 0) {
              return currentSort.desc ? -result : result
            }
            return left.index - right.index
          })
          .map((item) => item.row)
        return sorted
      }

      const sorted = data
        .map((row, index) => ({ row, index }))
        .sort((left, right) => {
          const leftValue = normalizeSortValue(getSortValue(column, left.row))
          const rightValue = normalizeSortValue(getSortValue(column, right.row))

          if (leftValue === null && rightValue === null) {
            return left.index - right.index
          }
          if (leftValue === null) return 1
          if (rightValue === null) return -1

          if (typeof leftValue === "number" && typeof rightValue === "number") {
            const result = leftValue - rightValue
            return currentSort.desc ? -result : result
          }

          const result = String(leftValue).localeCompare(String(rightValue))
          if (result !== 0) {
            return currentSort.desc ? -result : result
          }
          return left.index - right.index
        })
        .map((item) => item.row)
      return sorted
    }, [columns, currentSort, data])

    const handleHeaderPress = React.useCallback(
      (column: DataTableColumn<T>) => {
        if (!column.sortable) return
        if (!currentSort || currentSort.id !== column.id) {
          handleSortChange({ id: column.id, desc: false })
          return
        }
        if (currentSort.desc) {
          handleSortChange(undefined)
          return
        }
        handleSortChange({ id: column.id, desc: true })
      },
      [currentSort, handleSortChange],
    )

    const resolveRowKey = React.useCallback(
      (row: T) => {
        if (getRowId) {
          return getRowId(row)
        }
        if (row && typeof row === "object") {
          if ("id" in row) {
            return String((row as { id?: unknown }).id)
          }
          if ("key" in row) {
            return String((row as { key?: unknown }).key)
          }
          const storedKey = rowKeyMapRef.current.get(row)
          if (storedKey) return storedKey
          const nextKey = `row-${rowKeyCounterRef.current++}`
          rowKeyMapRef.current.set(row, nextKey)
          return nextKey
        }
        return String(row)
      },
      [getRowId],
    )

    const renderHeaderCell = (column: DataTableColumn<T>) => {
      const headerContent =
        typeof column.header === "function"
          ? column.header(column)
          : column.header ?? column.id
      const isSorted = currentSort?.id === column.id
      const sortDirection = isSorted
        ? currentSort?.desc
          ? "descending"
          : "ascending"
        : "none"
      const columnWidth =
        column.width !== undefined ? { width: column.width } : styles.cellFlex
      const alignStyle =
        column.align === "center"
          ? styles.cellAlignCenter
          : column.align === "right"
            ? styles.cellAlignRight
            : undefined

      if (column.sortable) {
        return (
          <Pressable
            key={column.id}
            role={Platform.OS === "web" ? "columnheader" : undefined}
            aria-sort={Platform.OS === "web" ? sortDirection : undefined}
            accessibilityRole="button"
            accessibilityState={{ selected: isSorted }}
            onPress={() => handleHeaderPress(column)}
            // @ts-expect-error - onKeyDown is web-only
            onKeyDown={
              Platform.OS === "web"
                ? (event: { key?: string; preventDefault?: () => void }) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault?.()
                      handleHeaderPress(column)
                    }
                  }
                : undefined
            }
            style={[styles.cell, styles.headerCell, columnWidth, alignStyle, headerCellStyle]}
          >
            {typeof headerContent === "string" ||
            typeof headerContent === "number" ? (
              <Text style={[styles.headerText, textStyle]}>{headerContent}</Text>
            ) : (
              headerContent
            )}
            {isSorted ? (
              <Text style={styles.sortIndicator}>
                {currentSort?.desc ? "v" : "^"}
              </Text>
            ) : null}
          </Pressable>
        )
      }

      return (
        <View
          key={column.id}
          role={Platform.OS === "web" ? "columnheader" : undefined}
          style={[styles.cell, styles.headerCell, columnWidth, alignStyle, headerCellStyle]}
        >
          {typeof headerContent === "string" ||
          typeof headerContent === "number" ? (
            <Text style={[styles.headerText, textStyle]}>{headerContent}</Text>
          ) : (
            headerContent
          )}
        </View>
      )
    }

    const renderBodyContent = () => {
      if (loading) {
        return (
          <View style={styles.emptyRow}>
            {renderLoading ?? (
              <Text style={[styles.emptyText, textStyle]}>Loading...</Text>
            )}
          </View>
        )
      }
      if (sortedData.length === 0) {
        return (
          <View style={styles.emptyRow}>
            {renderEmpty ?? (
              <Text style={[styles.emptyText, textStyle]}>{emptyMessage}</Text>
            )}
          </View>
        )
      }

      return sortedData.map((row, rowIndex) => {
        const rowKey = resolveRowKey(row)
        const handleRowPress = (event: unknown) => {
          if (onRowPress) {
            onRowPress(row, rowIndex)
          }
          return event
        }

        const rowContent = columns.map((column) => {
          const content = resolveCellValue(column, row, rowIndex)
          const columnWidth =
            column.width !== undefined ? { width: column.width } : styles.cellFlex
          const alignStyle =
            column.align === "center"
              ? styles.cellAlignCenter
              : column.align === "right"
                ? styles.cellAlignRight
                : undefined

          return (
            <View
              key={`${rowKey}-${column.id}`}
              role={Platform.OS === "web" ? "cell" : undefined}
              style={[styles.cell, columnWidth, alignStyle, cellStyle]}
            >
              {typeof content === "string" || typeof content === "number" ? (
                <Text style={[styles.cellText, textStyle]}>{content}</Text>
              ) : (
                content
              )}
            </View>
          )
        })

        if (onRowPress) {
          return (
            <Pressable
              key={rowKey}
              role={Platform.OS === "web" ? "row" : undefined}
              accessibilityRole="button"
              onPress={handleRowPress}
              style={({ pressed }) =>
                [
                  styles.row,
                  rowStyle,
                  pressed && styles.rowPressed,
                  // biome-ignore lint/suspicious/noExplicitAny: Complex style array with variants requires type assertion
                ] as any
              }
            >
              {rowContent}
            </Pressable>
          )
        }

        return (
          <View
            key={rowKey}
            role={Platform.OS === "web" ? "row" : undefined}
            style={[styles.row, rowStyle]}
          >
            {rowContent}
          </View>
        )
      })
    }

    return (
      <View
        ref={ref}
        role={Platform.OS === "web" ? "table" : undefined}
        style={[styles.container, style]}
        {...props}
      >
        <View role={Platform.OS === "web" ? "rowgroup" : undefined} style={styles.header}>
          <View role={Platform.OS === "web" ? "row" : undefined} style={styles.row}>
            {columns.map(renderHeaderCell)}
          </View>
        </View>
        <View role={Platform.OS === "web" ? "rowgroup" : undefined} style={styles.body}>
          {renderBodyContent()}
        </View>
      </View>
    )
  },
) as DataTableComponent

DataTable.displayName = "DataTable"

const styles = StyleSheet.create((theme) => ({
  container: {
    width: "100%",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
    overflow: "hidden",
  },
  header: {
    backgroundColor: theme.colors.muted,
  },
  body: {},
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowPressed: {
    backgroundColor: theme.colors.muted,
  },
  cell: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    justifyContent: "center",
  },
  headerCell: {
    minHeight: theme.spacing[10],
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[1],
  },
  headerText: {
    fontSize: theme.typography.sizes.xs,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: theme.colors.mutedForeground,
  },
  cellText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.foreground,
  },
  cellFlex: {
    flex: 1,
  },
  cellAlignCenter: {
    alignItems: "center",
  },
  cellAlignRight: {
    alignItems: "flex-end",
  },
  sortIndicator: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.mutedForeground,
  },
  emptyRow: {
    paddingVertical: theme.spacing[6],
    paddingHorizontal: theme.spacing[3],
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.mutedForeground,
  },
}))
