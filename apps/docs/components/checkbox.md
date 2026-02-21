# Checkbox

A control that allows the user to toggle between checked and not checked.

## Installation

```bash
npx shadcn@latest add @shadniwind/checkbox
```

## Usage

```tsx
import { Checkbox } from "~/components/ui/checkbox"
import { Label } from "~/components/ui/label"
import { View } from "react-native"

<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
  <Checkbox id="terms" />
  <Label nativeID="terms">Accept terms and conditions</Label>
</View>
```

## API Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `checked` | `boolean \| "indeterminate"` | - | The controlled checked state. |
| `defaultChecked` | `boolean \| "indeterminate"` | `false` | The initial checked state when uncontrolled. |
| `onCheckedChange` | `(checked: boolean \| "indeterminate") => void` | - | Event handler when state changes. |
| `disabled` | `boolean` | `false` | Prevents user interaction. |
