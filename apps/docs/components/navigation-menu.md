# Navigation Menu

A collection of links for navigating websites.

## Installation

```bash
npx shadcn@latest add @shadniwind/navigation-menu
```

## Usage

```tsx
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "~/components/ui/navigation-menu"
import { Text } from "react-native"

<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink>Link</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

## API Reference

### NavigationMenu

The root component.

### NavigationMenuList

The list of items.

### NavigationMenuItem

An item in the list.

### NavigationMenuTrigger

The button that toggles the content.

### NavigationMenuContent

The content to display.

### NavigationMenuLink

A link style for use in the menu.
