# Popover

Displays rich content in a portal, triggered by a button.

## Installation

```bash
npx shadcn@latest add @shadniwind/popover
```

## Usage

```tsx
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Button } from "~/components/ui/button"
import { Text } from "react-native"

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open Popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    <Text>Place content for the popover here.</Text>
  </PopoverContent>
</Popover>
```

## API Reference

### Popover

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `open` | `boolean` | - | The controlled open state. |
| `defaultOpen` | `boolean` | `false` | The initial open state. |
| `onOpenChange` | `(open: boolean) => void` | - | Event handler when state changes. |
| `modal` | `boolean` | `true` | Whether the popover acts as a modal (scrim + focus trap). |

### PopoverContent

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` | The preferred side. |
| `align` | `"start" \| "center" \| "end"` | `"center"` | The preferred alignment. |
| `sideOffset` | `number` | `4` | Distance from the anchor. |
