# Toggle Group

A set of two-state buttons that can be toggled on or off.

## Installation

```bash
npx shadniwind@latest add toggle-group
```

## Usage

```tsx
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group"
import { Bold, Italic, Underline } from "lucide-react-native"

// Single selection
<ToggleGroup type="single" defaultValue="a">
  <ToggleGroupItem value="a">A</ToggleGroupItem>
  <ToggleGroupItem value="b">B</ToggleGroupItem>
  <ToggleGroupItem value="c">C</ToggleGroupItem>
</ToggleGroup>

// Multiple selection
<ToggleGroup type="multiple">
  <ToggleGroupItem value="bold" aria-label="Toggle bold">
    <Bold size={16} color="currentColor" />
  </ToggleGroupItem>
  <ToggleGroupItem value="italic" aria-label="Toggle italic">
    <Italic size={16} color="currentColor" />
  </ToggleGroupItem>
  <ToggleGroupItem value="underline" aria-label="Toggle underline">
    <Underline size={16} color="currentColor" />
  </ToggleGroupItem>
</ToggleGroup>
```

## API Reference

### ToggleGroup

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | `"single" \| "multiple"` | - | The type of selection behavior. |
| `value` | `string \| string[]` | - | The controlled value. |
| `defaultValue` | `string \| string[]` | - | The initial value. |
| `onValueChange` | `(value: string \| string[]) => void` | - | Event handler when value changes. |
| `disabled` | `boolean` | `false` | Prevents user interaction. |

### ToggleGroupItem

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | - | The unique value of the item. |
| `disabled` | `boolean` | `false` | Prevents user interaction. |
