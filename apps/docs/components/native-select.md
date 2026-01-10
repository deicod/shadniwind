# Native Select

Wrapper around the native picker component.

## Installation

```bash
npx shadniwind@latest add native-select
```

## Usage

```tsx
import { NativeSelect } from "~/components/ui/native-select"
import * as React from "react"

export default function NativeSelectDemo() {
  const [value, setValue] = React.useState("")

  return (
    <NativeSelect
      value={value}
      onValueChange={setValue}
      options={[
        { label: "Apple", value: "apple" },
        { label: "Banana", value: "banana" },
        { label: "Blueberry", value: "blueberry" },
        { label: "Grapes", value: "grapes" },
        { label: "Pineapple", value: "pineapple" },
      ]}
      placeholder="Select a fruit"
    />
  )
}
```

## API Reference

### NativeSelect

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | - | The controlled value. |
| `onValueChange` | `(value: string) => void` | - | Callback when value changes. |
| `options` | `NativeSelectOption[]` | - | Array of options to display. |
| `placeholder` | `string` | - | Placeholder text to display when no value is selected. |
| `disabled` | `boolean` | `false` | Whether the select is disabled. |

### NativeSelectOption

| Prop | Type | Description |
| :--- | :--- | :--- |
| `label` | `string` | The display label. |
| `value` | `string` | The value. |
| `disabled` | `boolean` | Whether the option is disabled. |
