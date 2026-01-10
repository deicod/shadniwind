# Tooltip

A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.

## Installation

```bash
npx shadniwind@latest add tooltip
```

## Usage

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { Button } from "~/components/ui/button"
import { Text } from "react-native"

export default function TooltipDemo() {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="outline">
          <Text>Hover me</Text>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <Text>Add to library</Text>
      </TooltipContent>
    </Tooltip>
  )
}
```

## API Reference

### Tooltip

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `open` | `boolean` | - | Controlled open state. |
| `defaultOpen` | `boolean` | `false` | Default open state. |
| `onOpenChange` | `(open: boolean) => void` | - | Callback when open state changes. |
| `delayDuration` | `number` | `700` | Delay before opening. |

### TooltipTrigger

The element that triggers the tooltip.

### TooltipContent

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"top"` | The preferred side. |
| `sideOffset` | `number` | `4` | Offset from the trigger. |
| `align` | `"start" \| "center" \| "end"` | `"center"` | Alignment. |
