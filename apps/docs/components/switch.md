# Switch

A control that allows the user to toggle between checked and not checked.

## Installation

```bash
npx shadcn@latest add @shadniwind/switch
```

## Usage

```tsx
import { Switch } from "~/components/ui/switch"
import { Label } from "~/components/ui/label"
import { View } from "react-native"

<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
  <Switch id="airplane-mode" />
  <Label nativeID="airplane-mode">Airplane Mode</Label>
</View>
```

## API Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `checked` | `boolean` | - | The controlled checked state. |
| `defaultChecked` | `boolean` | `false` | The initial checked state when uncontrolled. |
| `onCheckedChange` | `(checked: boolean) => void` | - | Event handler when state changes. |
| `disabled` | `boolean` | `false` | Prevents user interaction. |
