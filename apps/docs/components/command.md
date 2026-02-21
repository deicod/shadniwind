# Command

Fast, composable, unstyled command menu for React Native.

## Installation

```bash
npx shadcn@latest add @shadniwind/command
```

## Usage

```tsx
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "~/components/ui/command"
import { Text } from "react-native"

export function CommandDemo() {
  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem value="calendar">
            <Text>Calendar</Text>
          </CommandItem>
          <CommandItem value="search-emoji">
            <Text>Search Emoji</Text>
          </CommandItem>
          <CommandItem value="calculator">
            <Text>Calculator</Text>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem value="profile">
            <Text>Profile</Text>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem value="billing">
            <Text>Billing</Text>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem value="settings">
            <Text>Settings</Text>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
```

## API Reference

### Command

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | - | The controlled value (query) of the command menu. |
| `onValueChange` | `(value: string) => void` | - | Event handler called when the value (query) changes. |
| `filter` | `(item: CommandItemData, query: string) => boolean` | - | Custom filter function. |
| `shouldFilter` | `boolean` | `true` | Whether to filter items based on the query. |

### CommandInput

The search input field.

### CommandList

The container for command items.

### CommandItem

| Prop | Type | Description |
| :--- | :--- | :--- |
| `value` | `string` | The value of the item. |
| `onSelect` | `(value: string) => void` | Callback called when the item is selected. |
| `disabled` | `boolean` | Whether the item is disabled. |

### CommandGroup

Groups items together.

### CommandSeparator

Visual separator between groups or items.

### CommandShortcut

Displays a keyboard shortcut for an item.
