# Kbd

Displays a keyboard key or shortcut.

## Installation

```bash
npx shadniwind@latest add kbd
```

## Usage

```tsx
import { Kbd } from "~/components/ui/kbd"
import { Text } from "react-native"

<Text>
  Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd>
</Text>
```

## API Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `"default" \| "outline"` | `"default"` | Visual style of the key. |
| `size` | `"default" \| "sm" \| "lg"` | `"default"` | Size of the key. |
