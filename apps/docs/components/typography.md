# Typography

A set of text primitives for consistent typography.

## Installation

```bash
npx shadniwind@latest add typography
```

## Usage

```tsx
import { Typography } from "~/components/ui/typography"

<Typography variant="h1">Heading 1</Typography>
<Typography variant="p">Paragraph text.</Typography>
<Typography variant="muted">Muted text.</Typography>
```

## API Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `"h1"..."h6" \| "p" \| "lead" \| "small" \| "muted" \| "mono"` | `"p"` | typographic style to apply. |
| `align` | `"left" \| "center" \| "right"` | `"left"` | Text alignment. |
