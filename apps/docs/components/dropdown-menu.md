# Dropdown Menu

Displays a menu to the user — such as a set of actions or functions — triggered by a button.

## Installation

```bash
npx shadniwind@latest add dropdown-menu
```

## Usage

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Button } from "~/components/ui/button"
import { Text } from "react-native"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">
      <Text>Open</Text>
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <Text>Profile</Text>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Text>Billing</Text>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Text>Team</Text>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Text>Subscription</Text>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## API Reference

### DropdownMenu

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `open` | `boolean` | - | The controlled open state of the dropdown menu. |
| `defaultOpen` | `boolean` | `false` | The default open state of the dropdown menu. |
| `onOpenChange` | `(open: boolean) => void` | - | Event handler called when the open state of the dropdown menu changes. |
| `modal` | `boolean` | `false` | Whether the dropdown menu is modal. |

### DropdownMenuTrigger

The element that triggers the dropdown menu.

### DropdownMenuContent

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | "bottom" | The preferred side of the trigger to render the menu. |
| `sideOffset` | `number` | `4` | The distance in pixels from the trigger. |
| `align` | `"start" \| "center" \| "end"` | "start" | The preferred alignment against the trigger. |
| `avoidCollisions` | `boolean` | `true` | Whether to avoid collisions with the viewport edges. |

### DropdownMenuItem

An item in the menu.

### DropdownMenuCheckboxItem

An item that can be checked.

### DropdownMenuRadioGroup

Group for radio items.

### DropdownMenuRadioItem

An item that can be selected from a group.
