# Field

A high-level wrapper combining label, control, description, and error messages.

## Installation

```bash
npx shadcn@latest add @shadniwind/field
```

## Usage

```tsx
import { Field } from "~/components/ui/field"
import { Input } from "~/components/ui/input"

<Field
  label="Email"
  description="We'll never share your email."
  error="Invalid email address"
  required
>
  <Input placeholder="Enter your email" />
</Field>
```

## API Reference

### Field

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `label` | `string` | - | The label for the field. |
| `description` | `string` | - | Helper text to display below the label. |
| `error` | `string` | - | Error message to display. |
| `info` | `string` | - | Info message to display (when no error). |
| `required` | `boolean` | `false` | Whether the field is required. |
| `disabled` | `boolean` | `false` | Whether the field is disabled. |
