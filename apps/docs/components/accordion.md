# Accordion

A vertically stacked set of interactive headings that each reveal a section of content.

## Installation

```bash
npx shadniwind@latest add accordion
```

## Usage

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion"
import { Text } from "react-native"

<Accordion type="single" collapsible defaultValue="item-1">
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      <Text>Yes. It adheres to the WAI-ARIA design pattern.</Text>
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Is it styled?</AccordionTrigger>
    <AccordionContent>
      <Text>
        Yes. It comes with default styles that matches the other
        components&apos; aesthetic.
      </Text>
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-3">
    <AccordionTrigger>Is it animated?</AccordionTrigger>
    <AccordionContent>
      <Text>
        Yes. It's animated by default, but you can disable it if you prefer.
      </Text>
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

## API Reference

### Accordion

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | `"single" \| "multiple"` | "single" | Whether one or multiple items can be open at the same time. |
| `value` | `string \| string[]` | - | The controlled value of the item(s) to expand. |
| `defaultValue` | `string \| string[]` | - | The default value of the item(s) to expand. |
| `onValueChange` | `(value: string \| string[]) => void` | - | Event handler called when the expanded state of an item changes. |
| `disabled` | `boolean` | `false` | When true, prevents the user from interacting with the accordion. |

### AccordionItem

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | - | A unique value for the item. |
| `disabled` | `boolean` | `false` | When true, prevents the user from interacting with the item. |

### AccordionTrigger

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `showChevron` | `boolean` | `true` | Whether to show the chevron icon. |

### AccordionContent

Contains the content to be displayed when the item is expanded.
