# Spinner

Displays an animated loading indicator.

## Installation

```bash
npx shadniwind@latest add spinner
```

## Usage

```tsx
import { Spinner } from "~/components/ui/spinner"

<Spinner />
```

## Examples

### Variants

```tsx
<Spinner variant="default" />
<Spinner variant="primary" />
<Spinner variant="muted" />
```

## API Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `"default" \| "primary" \| "muted"` | `"default"` | The visual style of the spinner. |
