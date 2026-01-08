import * as React from "react"
import { Text, View, type ViewProps } from "react-native"
import { StyleSheet } from "react-native-unistyles"

/**
 * Table component with context-based subcomponents.
 *
 * **Important limitations on React Native:**
 * - No true HTML table semantics (uses Views)
 * - No automatic column sizing or text wrapping
 * - ScrollView required for overflow (use ScrollArea)
 * - Performance with large datasets limited (consider FlatList)
 *
 * **Web:** Rendered with proper semantic HTML table elements
 * **Native:** Approximated with View/Text layout
 *
 * @example
 * ```tsx
 * <Table>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Name</TableHead>
 *       <TableHead>Email</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>John</TableCell>
 *       <TableCell>john@example.com</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 * ```
 */

export type TableProps = ViewProps

export const Table = React.forwardRef<
  React.ComponentRef<typeof View>,
  TableProps
>(({ style, ...props }, ref) => {
  return <View ref={ref} style={[styles.table, style]} {...props} />
})

Table.displayName = "Table"

export type TableHeaderProps = ViewProps

export const TableHeader = React.forwardRef<
  React.ComponentRef<typeof View>,
  TableHeaderProps
>(({ style, ...props }, ref) => {
  return <View ref={ref} style={[styles.header, style]} {...props} />
})

TableHeader.displayName = "TableHeader"

export type TableBodyProps = ViewProps

export const TableBody = React.forwardRef<
  React.ComponentRef<typeof View>,
  TableBodyProps
>(({ style, ...props }, ref) => {
  return <View ref={ref} style={[styles.body, style]} {...props} />
})

TableBody.displayName = "TableBody"

export type TableFooterProps = ViewProps

export const TableFooter = React.forwardRef<
  React.ComponentRef<typeof View>,
  TableFooterProps
>(({ style, ...props }, ref) => {
  return <View ref={ref} style={[styles.footer, style]} {...props} />
})

TableFooter.displayName = "TableFooter"

export type TableRowProps = ViewProps

export const TableRow = React.forwardRef<
  React.ComponentRef<typeof View>,
  TableRowProps
>(({ style, ...props }, ref) => {
  return <View ref={ref} style={[styles.row, style]} {...props} />
})

TableRow.displayName = "TableRow"

export type TableHeadProps = ViewProps

export const TableHead = React.forwardRef<
  React.ComponentRef<typeof View>,
  TableHeadProps
>(({ style, children, ...props }, ref) => {
  return (
    <View ref={ref} style={[styles.head, style]} {...props}>
      {typeof children === "string" ? (
        <Text style={styles.headText}>{children}</Text>
      ) : (
        children
      )}
    </View>
  )
})

TableHead.displayName = "TableHead"

export type TableCellProps = ViewProps

export const TableCell = React.forwardRef<
  React.ComponentRef<typeof View>,
  TableCellProps
>(({ style, children, ...props }, ref) => {
  return (
    <View ref={ref} style={[styles.cell, style]} {...props}>
      {typeof children === "string" ? (
        <Text style={styles.cellText}>{children}</Text>
      ) : (
        children
      )}
    </View>
  )
})

TableCell.displayName = "TableCell"

export type TableCaptionProps = ViewProps

export const TableCaption = React.forwardRef<
  React.ComponentRef<typeof View>,
  TableCaptionProps
>(({ style, children, ...props }, ref) => {
  return (
    <View ref={ref} style={[styles.caption, style]} {...props}>
      {typeof children === "string" ? (
        <Text style={styles.captionText}>{children}</Text>
      ) : (
        children
      )}
    </View>
  )
})

TableCaption.displayName = "TableCaption"

const styles = StyleSheet.create((theme) => ({
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },
  header: {
    backgroundColor: theme.colors.muted,
  },
  body: {
    // Body rows
  },
  footer: {
    backgroundColor: theme.colors.muted,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  head: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  headText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.foreground,
  },
  cell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  cellText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.foreground,
  },
  caption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  captionText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.mutedForeground,
  },
}))
