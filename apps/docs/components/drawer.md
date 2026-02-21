# Drawer

A drawer component for React Native.

## Installation

```bash
npx shadcn@latest add @shadniwind/drawer
```

## Usage

```tsx
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer"
import { Button } from "~/components/ui/button"
import { Text } from "react-native"

<Drawer>
  <DrawerTrigger asChild>
    <Button variant="outline">
      <Text>Open Drawer</Text>
    </Button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Are you absolutely sure?</DrawerTitle>
      <DrawerDescription>This action cannot be undone.</DrawerDescription>
    </DrawerHeader>
    <DrawerFooter>
      <Button>
        <Text>Submit</Text>
      </Button>
      <DrawerClose asChild>
        <Button variant="outline">
          <Text>Cancel</Text>
        </Button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

## API Reference

### Drawer

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `open` | `boolean` | - | The controlled open state of the drawer. |
| `defaultOpen` | `boolean` | `false` | The default open state of the drawer. |
| `onOpenChange` | `(open: boolean) => void` | - | Event handler called when the open state of the drawer changes. |
| `modal` | `boolean` | `true` | Whether the drawer is modal. |

### DrawerContent

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `side` | `"top" \| "bottom" \| "left" \| "right"` | "bottom" | The side of the screen the drawer appears from. |
| `overlayStyle` | `StyleProp<ViewStyle>` | - | The style of the overlay. |
| `dismissable` | `boolean` | `true` | Whether the drawer can be dismissed by clicking outside or dragging. |

### DrawerClose

A button that closes the drawer.
