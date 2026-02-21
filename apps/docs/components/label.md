# Label

Renders an accessible label for an element.

## Installation

```bash
npx shadcn@latest add @shadniwind/label
```

## Usage

```tsx
import { Label } from "~/components/ui/label"
import { Checkbox } from "~/components/ui/checkbox"
import { View } from "react-native"

<View>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
    <Checkbox id="terms" />
    <Label nativeID="terms">Accept terms and conditions</Label>
  </View>
</View>
```

## API Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `nativeID` | `string` | - | The ID of the labeled element. |
| `disabled` | `boolean` | `false` | Applies disabled styles. |
