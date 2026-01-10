# Button Group

Groups related buttons together.

## Installation

```bash
npx shadniwind@latest add button-group
```

## Usage

```tsx
import { ButtonGroup } from "~/components/ui/button-group"
import { Button } from "~/components/ui/button"
import { Text } from "react-native"

<ButtonGroup>
  <Button variant="outline">
    <Text>One</Text>
  </Button>
  <Button variant="outline">
    <Text>Two</Text>
  </Button>
  <Button variant="outline">
    <Text>Three</Text>
  </Button>
</ButtonGroup>
```

## API Reference

### ButtonGroup

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `orientation` | `"horizontal" \| "vertical"` | "horizontal" | The orientation of the button group. |
| `showSeparators` | `boolean` | `false` | Whether to show separators between buttons. |
