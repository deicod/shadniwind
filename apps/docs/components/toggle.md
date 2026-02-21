# Toggle

A two-state button that can be either on or off.

## Installation

```bash
npx shadcn@latest add @shadniwind/toggle
```

## Usage

```tsx
import { Toggle } from "~/components/ui/toggle"
import { Bold } from "lucide-react-native"

<Toggle aria-label="Toggle bold">
  <Bold size={16} color="currentColor" />
</Toggle>
```

## API Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `pressed` | `boolean` | - | The controlled pressed state. |
| `defaultPressed` | `boolean` | `false` | The initial pressed state when uncontrolled. |
| `onPressedChange` | `(pressed: boolean) => void` | - | Event handler when state changes. |
| `disabled` | `boolean` | `false` | Prevents user interaction. |
