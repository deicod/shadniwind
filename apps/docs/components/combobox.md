# Combobox

Autocomplete input and command palette with a list of suggestions.

## Installation

```bash
npx shadniwind@latest add combobox
```

## Usage

```tsx
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
} from "~/components/ui/combobox"
import { Text } from "react-native"

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
]

export function ComboboxDemo() {
  const [value, setValue] = React.useState("")

  return (
    <Combobox
      value={value}
      onValueChange={setValue}
      filter={(item, query) => item.label.toLowerCase().includes(query.toLowerCase())}
    >
      <ComboboxInput placeholder="Select framework..." />
      <ComboboxContent>
        <ComboboxEmpty>No framework found.</ComboboxEmpty>
        {frameworks.map((framework) => (
          <ComboboxItem key={framework.value} value={framework.value} textValue={framework.label}>
            <Text>{framework.label}</Text>
          </ComboboxItem>
        ))}
      </ComboboxContent>
    </Combobox>
  )
}
```

## API Reference

### Combobox

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | - | The controlled value of the combobox. |
| `defaultValue` | `string` | - | The default value of the combobox. |
| `onValueChange` | `(value: string) => void` | - | Event handler called when the value changes. |
| `open` | `boolean` | - | The controlled open state. |
| `defaultOpen` | `boolean` | `false` | The default open state. |
| `onOpenChange` | `(open: boolean) => void` | - | Event handler called when the open state changes. |
| `inputValue` | `string` | - | The controlled input value. |
| `onInputValueChange` | `(value: string) => void` | - | Event handler called when the input value changes. |
| `filter` | `(item: ComboboxItemData, query: string) => boolean` | - | Custom filter function. |

### ComboboxInput

The text input field.

### ComboboxContent

The popover content containing the list of items.

### ComboboxItem

| Prop | Type | Description |
| :--- | :--- | :--- |
| `value` | `string` | The value of the item. |
| `textValue` | `string` | The text value used for input display and filtering. |
| `disabled` | `boolean` | Whether the item is disabled. |

### ComboboxEmpty

Content to display when no items match the filter.
