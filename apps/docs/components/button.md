# Button

Displays a button or a component that looks like a button.

## Installation

```bash
npx shadcn@latest add @shadniwind/button
```

## Usage

```tsx
import { Button } from "~/components/ui/button"

<Button onPress={() => console.log("Pressed")}>
  Button
</Button>
```

## Examples

### Variants

```tsx
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

### Sizes

```tsx
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

### Loading

```tsx
<Button loading>Please wait</Button>
```

## API Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `"default" \| "destructive" \| "outline" \| "secondary" \| "ghost" \| "link"` | `"default"` | The visual style of the button. |
| `size` | `"default" \| "sm" \| "lg" \| "icon"` | `"default"` | The size of the button. |
| `loading` | `boolean` | `false` | If true, displays a spinner and disables interaction. |
| `disabled` | `boolean` | `false` | Prevents user interaction. |
