# Dialog

A window overlaid on either the primary window or another dialog window, rendering the content underneath inert.

## Installation

```bash
npx shadcn@latest add @shadniwind/dialog
```

## Usage

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Text, View } from "react-native"

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">
      <Text>Edit Profile</Text>
    </Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here. Click save when you're done.
      </DialogDescription>
    </DialogHeader>
    <View className="grid gap-4 py-4">
      <View className="grid grid-cols-4 items-center gap-4">
        <Label nativeID="name" className="text-right">
          Name
        </Label>
        <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
      </View>
      <View className="grid grid-cols-4 items-center gap-4">
        <Label nativeID="username" className="text-right">
          Username
        </Label>
        <Input id="username" defaultValue="@peduarte" className="col-span-3" />
      </View>
    </View>
    <DialogFooter>
      <Button type="submit">
        <Text>Save changes</Text>
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## API Reference

### Dialog

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `open` | `boolean` | - | The controlled open state of the dialog. |
| `defaultOpen` | `boolean` | `false` | The default open state of the dialog. |
| `onOpenChange` | `(open: boolean) => void` | - | Event handler called when the open state of the dialog changes. |
| `modal` | `boolean` | `true` | Whether the dialog is modal. |

### DialogContent

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `size` | `"default" \| "sm" \| "lg" \| "fullscreen"` | "default" | The size of the dialog content. |
| `overlayStyle` | `StyleProp<ViewStyle>` | - | The style of the overlay. |
| `dismissable` | `boolean` | `true` | Whether the dialog can be dismissed by clicking outside or pressing Escape. |

### DialogClose

A button that closes the dialog.
