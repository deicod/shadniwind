# Item

A layout primitive for consistent spacing between items.

## Installation

```bash
npx shadcn@latest add @shadniwind/item
```

## Usage

```tsx
import { Item } from "~/components/ui/item"
import { Text, View } from "react-native"

<View>
  <Item>
    <Text>First Item</Text>
  </Item>
  <Item>
    <Text>Second Item</Text>
  </Item>
</View>
```

## API Reference

### Item

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `spacing` | `"compact" \| "default" \| "relaxed"` | "default" | The bottom margin spacing. |
