# Separator

Visually or semantically separates content.

## Installation

```bash
npx shadniwind@latest add separator
```

## Usage

```tsx
import { Separator } from "~/components/ui/separator"
import { View, Text } from "react-native"

<View>
  <Text>Content Above</Text>
  <Separator />
  <Text>Content Below</Text>
</View>
```

## Examples

### Vertical

```tsx
<View style={{ flexDirection: 'row', height: 20 }}>
  <Text>Left</Text>
  <Separator orientation="vertical" />
  <Text>Right</Text>
</View>
```

## API Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | The orientation of the separator. |
| `decorative` | `boolean` | `true` | Whether the separator is purely cosmetic (skips accessibility). |
