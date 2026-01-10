# Collapsible

An interactive component which expands/collapses a panel.

## Installation

```bash
npx shadniwind@latest add collapsible
```

## Usage

```tsx
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible"
import { Text } from "react-native"

<Collapsible>
  <CollapsibleTrigger>
    <Text>Can I use this in my project?</Text>
  </CollapsibleTrigger>
  <CollapsibleContent>
    <Text>Yes. Free to use for personal and commercial projects.</Text>
  </CollapsibleContent>
</Collapsible>
```

## API Reference

### Collapsible

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `open` | `boolean` | - | The controlled open state. |
| `defaultOpen` | `boolean` | `false` | The initial open state when uncontrolled. |
| `onOpenChange` | `(open: boolean) => void` | - | Event handler when state changes. |
| `disabled` | `boolean` | `false` | Prevents interaction. |

### CollapsibleTrigger

The button that toggles the collapsible. Accepts `Pressable` props.

### CollapsibleContent

The component that contains the collapsible content. Accepts `View` props.
