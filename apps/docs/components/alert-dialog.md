# Alert Dialog

A modal dialog that interrupts the user with important content and expects a response.

## Installation

```bash
npx shadcn@latest add @shadniwind/alert-dialog
```

## Usage

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { Text } from "react-native"

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="outline">
      <Text>Show Dialog</Text>
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>
        <Text>Cancel</Text>
      </AlertDialogCancel>
      <AlertDialogAction>
        <Text>Continue</Text>
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## API Reference

### AlertDialog

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `open` | `boolean` | - | The controlled open state of the dialog. |
| `defaultOpen` | `boolean` | `false` | The default open state of the dialog. |
| `onOpenChange` | `(open: boolean) => void` | - | Event handler called when the open state of the dialog changes. |

### AlertDialogContent

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `size` | `"default" \| "sm" \| "lg" \| "fullscreen"` | "default" | The size of the dialog content. |
| `overlayStyle` | `StyleProp<ViewStyle>` | - | The style of the overlay. |
| `dismissable` | `boolean` | `false` | Whether the dialog can be dismissed by clicking outside or pressing Escape. |

### AlertDialogAction

A button that confirms the action. This button does not close the dialog by default.

### AlertDialogCancel

A button that cancels the action. This button closes the dialog by default.
