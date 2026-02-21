# Roving Focus

The Roving Focus primitive manages focus within a group of items using arrow keys. It is commonly used for components like tabs, ragio groups, and toolbars.

## Installation

```bash
npx shadcn@latest add @shadniwind/roving-focus
```

## Usage

Use `RovingFocusGroup` to wrap a set of `RovingFocusItem` components.

```tsx
import { RovingFocusGroup, RovingFocusItem } from "~/components/primitives/roving-focus";
import { Text, View } from "react-native";

export function Toolbar() {
  return (
    <RovingFocusGroup orientation="horizontal" loop>
      <RovingFocusItem value="bold">
        <Text>Bold</Text>
      </RovingFocusItem>
      <RovingFocusItem value="italic">
        <Text>Italic</Text>
      </RovingFocusItem>
      <RovingFocusItem value="underline">
        <Text>Underline</Text>
      </RovingFocusItem>
    </RovingFocusGroup>
  );
}
```

## API Reference

### RovingFocusGroup

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `orientation` | `"horizontal" \| "vertical" \| "both"` | `"vertical"` | Defines which arrow keys navigate the group. |
| `loop` | `boolean` | `false` | Whether navigation loops from last to first item. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Text direction for navigation logic. |
| `value` | `string` | - | Controlled value of the currently focused item. |
| `defaultValue` | `string` | - | Initial value for uncontrolled mode. |
| `onValueChange` | `(value: string) => void` | - | Callback when focused item changes. |

### RovingFocusItem

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | **Required** | Unique identifier for the item. |
| `disabled` | `boolean` | `false` | If true, item is skipped during navigation. |
| `asChild` | `boolean` | `false` | If true, merges props onto the immediate child. |
