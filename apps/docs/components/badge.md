# Badge

Displays a badge or a component that looks like a badge.

## Installation

```bash
npx shadcn@latest add @shadniwind/badge
```

## Usage

```tsx
import { Badge } from "~/components/ui/badge"

<Badge>Badge</Badge>
```

## Examples

### Variants

```tsx
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

## API Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `"default" \| "secondary" \| "destructive" \| "outline"` | `"default"` | The visual style of the badge. |
