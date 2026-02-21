# Context Menu

Displays a menu to the user — such as a set of actions or functions — triggered by a right-click or long-press.

## Installation

```bash
npx shadcn@latest add @shadniwind/context-menu
```

## Usage

```tsx
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "~/components/ui/context-menu"
import { Text, View } from "react-native"

<ContextMenu>
  <ContextMenuTrigger>
    <View style={{ height: 150, width: 300, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }}>
      <Text>Right click here</Text>
    </View>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Profile</ContextMenuItem>
    <ContextMenuItem>Billing</ContextMenuItem>
    <ContextMenuItem>Team</ContextMenuItem>
    <ContextMenuItem>Subscription</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

## API Reference

### ContextMenu

The root component.

### ContextMenuTrigger

The element that triggers the menu.

### ContextMenuContent

The component that pops out.

### ContextMenuItem

An item in the menu.

### ContextMenuCheckboxItem

An item that can be checked.

### ContextMenuRadioGroup

Group for radio items.

### ContextMenuRadioItem

An item that can be selected from a group.
