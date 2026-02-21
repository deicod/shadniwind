# Input

Displays a form input field or a component that looks like an input field.

## Installation

```bash
npx shadcn@latest add @shadniwind/input
```

## Usage

```tsx
import { Input } from "~/components/ui/input"

<Input placeholder="Email" />
```

## API Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `disabled` | `boolean` | `false` | Prevents user interaction. |
| `placeholder` | `string` | - | Helper text to display when empty. |
| `value` | `string` | - | The input control's value. |
| `onChangeText` | `(text: string) => void` | - | Callback when text changes. |
