# Pagination

Pagination with page navigation, next and previous links.

## Installation

```bash
npx shadcn@latest add @shadniwind/pagination
```

## Usage

```tsx
import { Pagination } from "~/components/ui/pagination"
import * as React from "react"

export default function PaginationDemo() {
  const [page, setPage] = React.useState(1)

  return (
    <Pagination
      currentPage={page}
      totalPages={10}
      onPageChange={setPage}
    />
  )
}
```

## API Reference

### Pagination

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `currentPage` | `number` | - | The current page number (1-indexed). |
| `totalPages` | `number` | - | The total number of pages. |
| `onPageChange` | `(page: number) => void` | - | Callback when page changes. |
| `siblingCount` | `number` | `1` | Number of page buttons to show on each side of current page. |
| `showEdges` | `boolean` | `true` | Whether to show first/last page buttons. |
