# Table

A responsive table component.

## Installation

```bash
npx shadcn@latest add @shadniwind/table
```

## Usage

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"

<Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Method</TableHead>
      <TableHead>Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>INV001</TableCell>
      <TableCell>Paid</TableCell>
      <TableCell>Credit Card</TableCell>
      <TableCell>$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## API Reference

All table components accept standard `View` props (or `Text` for text-based subcomponents).

### Table

The main container.

### TableHeader

Container for header rows.

### TableBody

Container for body rows.

### TableFooter

Container for footer rows.

### TableRow

Container for cells.

### TableHead

Header cell.

### TableCell

Data cell.

### TableCaption

Caption text.
