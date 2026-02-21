# Textarea

Displays a form textarea or a component that looks like a textarea.

## Installation

```bash
npx shadcn@latest add @shadniwind/textarea
```

## Usage

```tsx
import { Textarea } from "~/components/ui/textarea"

<Textarea placeholder="Type your message here." />
```

## API Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `placeholder` | `string` | - | Helper text to display when empty. |
| `disabled` | `boolean` | `false` | Prevents user interaction. |
| `multiline` | `boolean` | `true` | Whether the input works on multiple lines. |
| `textAlignVertical` | `"top" \| "center" \| "bottom" \| "auto"` | `"top"` | Alignment of the text within the area. |
