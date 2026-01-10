# Data Table

Powerful table and data grids built for React Native.

## Installation

```bash
npx shadniwind@latest add data-table
```

## Usage

```tsx
import { DataTable, type DataTableColumn } from "~/components/ui/data-table"
import { Text } from "react-native"

type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}

const data: Payment[] = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "489e1d42",
    amount: 125,
    status: "processing",
    email: "example@gmail.com",
  },
  // ...
]

const columns: DataTableColumn<Payment>[] = [
  {
    id: "status",
    accessor: "status",
    header: "Status",
  },
  {
    id: "email",
    accessor: "email",
    header: "Email",
  },
  {
    id: "amount",
    accessor: "amount",
    header: "Amount",
    cell: (row) => <Text>{`$${row.amount}`}</Text>,
    align: "right",
  },
]

export function DataTableDemo() {
  return <DataTable data={data} columns={columns} />
}
```

## API Reference

### DataTable

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `data` | `T[]` | - | The data to display. |
| `columns` | `DataTableColumn<T>[]` | - | The column definitions. |
| `sort` | `DataTableSort` | - | The controlled sort state. |
| `defaultSort` | `DataTableSort` | - | The default sort state. |
| `onSortChange` | `(sort?: DataTableSort) => void` | - | Event handler called when the sort state changes. |
| `onRowPress` | `(row: T, index: number) => void` | - | Callback called when a row is pressed. |
| `loading` | `boolean` | `false` | Whether the table is in a loading state. |
| `emptyMessage` | `string` | "No results." | Message to display when there is no data. |

### DataTableColumn

| Prop | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier for the column. |
| `header` | `ReactNode \| (column) => ReactNode` | The header content. |
| `accessor` | `keyof T \| (row: T) => unknown` | The accessor for the column data. |
| `cell` | `(row: T, index: number) => ReactNode` | Custom cell renderer. |
| `sortable` | `boolean` | Whether the column is sortable. |
| `align` | `"left" \| "center" \| "right"` | The alignment of the cell content. |
| `width` | `DimensionValue` | The width of the column. |
