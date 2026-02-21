# Hover Card

For sighted users to preview content available behind a link.

## Installation

```bash
npx shadcn@latest add @shadniwind/hover-card
```

## Usage

```tsx
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card"
import { Button } from "~/components/ui/button"
import { Text } from "react-native"

<HoverCard>
  <HoverCardTrigger asChild>
    <Button variant="link">@shadcn</Button>
  </HoverCardTrigger>
  <HoverCardContent>
    <Text>The React Framework associated with @shadcn.</Text>
  </HoverCardContent>
</HoverCard>
```

## API Reference

### HoverCard

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `open` | `boolean` | - | The controlled open state. |
| `defaultOpen` | `boolean` | `false` | The initial open state. |
| `onOpenChange` | `(open: boolean) => void` | - | Event handler when state changes. |
| `openDelay` | `number` | `700` | Delay before opening. |
| `closeDelay` | `number` | `300` | Delay before closing. |

### HoverCardContent

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"top"` | The preferred side. |
| `align` | `"start" \| "center" \| "end"` | `"center"` | The preferred alignment. |
