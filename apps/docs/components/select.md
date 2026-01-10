# Select

Displays a list of options for the user to pick from—triggered by a button.

## Installation

```bash
npx shadniwind@latest add select
```

## Usage

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import * as React from "react"

export default function SelectDemo() {
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="system">System</SelectItem>
      </SelectContent>
    </Select>
  )
}
```

## API Reference

### Select

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | - | The controlled value. |
| `defaultValue` | `string` | - | The default value. |
| `onValueChange` | `(value: string) => void` | - | Callback when value changes. |
| `open` | `boolean` | - | The controlled open state. |
| `defaultOpen` | `boolean` | `false` | The default open state. |
| `onOpenChange` | `(open: boolean) => void` | - | Callback when open state changes. |
| `disabled` | `boolean` | `false` | Whether the select is disabled. |

### SelectTrigger

The trigger button that opens the select.

### SelectValue

Displays the selected value or a placeholder.

### SelectContent

The popover content containing options.

### SelectItem

| Prop | Type | Description |
| :--- | :--- | :--- |
| `value` | `string` | The value of the item. |
| `disabled` | `boolean` | Whether the item is disabled. |
