# Sheet

Extends the Dialog component to display content that complements the main screen.

## Installation

```bash
npx shadniwind@latest add sheet
```

## Usage

```tsx
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet"
import { Button } from "~/components/ui/button"
import { Text } from "react-native"

<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">
      <Text>Open</Text>
    </Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Edit profile</SheetTitle>
      <SheetDescription>
        Make changes to your profile here. Click save when you're done.
      </SheetDescription>
    </SheetHeader>
    {/* Body content */}
    <SheetFooter>
      <SheetClose asChild>
        <Button type="submit">
          <Text>Save changes</Text>
        </Button>
      </SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

## API Reference

### Sheet

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `open` | `boolean` | - | The controlled open state of the sheet. |
| `defaultOpen` | `boolean` | `false` | The default open state of the sheet. |
| `onOpenChange` | `(open: boolean) => void` | - | Event handler called when the open state of the sheet changes. |
| `modal` | `boolean` | `true` | Whether the sheet is modal. |

### SheetContent

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `side` | `"top" \| "bottom" \| "left" \| "right"` | "right" | The side of the screen the sheet appears from. |
| `overlayStyle` | `StyleProp<ViewStyle>` | - | The style of the overlay. |
| `dismissable` | `boolean` | `true` | Whether the sheet can be dismissed by clicking outside or by pressing Escape (web). |

### SheetClose

A button that closes the sheet.
