# Alert

Displays a callout for user attention.

## Installation

```bash
npx shadniwind@latest add alert
```

## Usage

```tsx
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"

<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components to your app using the cli.
  </AlertDescription>
</Alert>
```

## Examples

### Variants

```tsx
<Alert variant="default">
  <AlertTitle>Default</AlertTitle>
  <AlertDescription>Default alert variant.</AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Destructive</AlertTitle>
  <AlertDescription>Destructive alert variant.</AlertDescription>
</Alert>
```

## API Reference

### Alert

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `"default" \| "destructive"` | `"default"` | The visual style of the alert. |
