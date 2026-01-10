# Menubar

A visually persistent menu common in desktop applications that provides quick access to a consistent set of commands.

## Installation

```bash
npx shadniwind@latest add menubar
```

## Usage

```tsx
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "~/components/ui/menubar"
import { Text } from "react-native"

<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>
        New Tab <MenubarShortcut>⌘T</MenubarShortcut>
      </MenubarItem>
      <MenubarItem>New Window</MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Share</MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Print</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

## API Reference

### Menubar

The root component.

### MenubarMenu

Contains the trigger and content.

### MenubarTrigger

The button that toggles the menu.

### MenubarContent

The component that pops out when the menu is active.

### MenubarItem

An item in the menu.

### MenubarCheckboxItem

An item that can be checked.

### MenubarRadioGroup

Group for radio items.

### MenubarRadioItem

An item that can be selected from a group.
