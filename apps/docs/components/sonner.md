# Sonner

An opinionated toast component for React Native.

## Installation

```bash
npx shadniwind@latest add sonner
```

## Usage

```tsx
import { Toaster, toast } from "~/components/ui/sonner"
import { Button } from "~/components/ui/button"
import { Text, View } from "react-native"

export default function SonnerDemo() {
  return (
    <View>
      <Toaster />
      <Button
        onPress={() =>
          toast("Event has been created", {
            description: "Sunday, December 03, 2023 at 9:00 AM",
            action: {
              label: "Undo",
              onClick: () => console.log("Undo"),
            },
          })
        }
      >
        <Text>Show Toast</Text>
      </Button>
    </View>
  )
}
```

## API Reference

### Toaster

Place the `<Toaster />` component at the root of your app.

### toast(message, data)

| Param | Type | Description |
| :--- | :--- | :--- |
| `message` | `string` | The title message of the toast. |
| `data` | `ToastProps` | Optional configuration object. |

### ToastProps

| Prop | Type | Description |
| :--- | :--- | :--- |
| `description` | `string` | additional details. |
| `action` | `{ label: string, onClick: () => void }` | Action button configuration. |
| `cancel` | `{ label: string, onClick: () => void }` | Cancel button configuration. |
| `duration` | `number` | Duration in milliseconds. |
