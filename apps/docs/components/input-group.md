# Input Group

Allows users to combine inputs with buttons, icons, or text.

## Installation

```bash
npx shadcn@latest add @shadniwind/input-group
```

## Usage

```tsx
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group"
import { Input } from "~/components/ui/input"

export default function InputGroupDemo() {
  return (
    <InputGroup>
      <InputGroupAddon>https://</InputGroupAddon>
      <InputGroupInput>
        <Input
          placeholder="example.com"
          style={{ borderWidth: 0, borderRadius: 0 }}
        />
      </InputGroupInput>
    </InputGroup>
  )
}
```

## API Reference

### InputGroup

Container component for grouping elements.

### InputGroupAddon

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `position` | `"left" \| "right"` | `"left"` | Position of the addon. |

### InputGroupInput

Wrapper for the `Input` component to ensure proper styling within the group.

### InputGroupIcon

Container for icons within the group.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `position` | `"left" \| "right"` | `"left"` | Position of the icon. |
