# Radio Group

A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time.

## Installation

```bash
npx shadcn@latest add @shadniwind/radio-group
```

## Usage

```tsx
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Label } from "~/components/ui/label"
import { View } from "react-native"

<RadioGroup defaultValue="comfortable">
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
    <RadioGroupItem value="default" id="r1" />
    <Label nativeID="r1">Default</Label>
  </View>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
    <RadioGroupItem value="comfortable" id="r2" />
    <Label nativeID="r2">Comfortable</Label>
  </View>
</RadioGroup>
```

## API Reference

### RadioGroup

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | - | The controlled value of the selected item. |
| `defaultValue` | `string` | - | The initial value of the selected item. |
| `onValueChange` | `(value: string) => void` | - | Event handler when value changes. |
| `disabled` | `boolean` | `false` | Prevents user interaction. |

### RadioGroupItem

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | - | The unique value of the item. |
| `disabled` | `boolean` | `false` | Prevents user interaction. |
