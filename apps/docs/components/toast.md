# Toast

A toast notification primitive.

## Installation

```bash
npx shadniwind@latest add toast
```

## Usage

```tsx
import { useToast } from "~/components/ui/toast"
import { Button } from "~/components/ui/button"
import { Text } from "react-native"

export default function ToastDemo() {
  const { toast } = useToast()

  return (
    <Button
      onPress={() => {
        toast({
          title: "Scheduled: Catch up",
          description: "Friday, February 10, 2023 at 5:57 PM",
        })
      }}
    >
      <Text>Show Toast</Text>
    </Button>
  )
}
```

## API Reference

### useToast

Returns `{ toast, dismiss, toasts }`.

### toast(props)

| Prop | Type | Description |
| :--- | :--- | :--- |
| `title` | `string` | The title of the toast. |
| `description` | `string` | The description of the toast. |
| `variant` | `"default" \| "destructive"` | The style variant. |
| `duration` | `number` | Duration in ms. |
