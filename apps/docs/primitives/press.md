# Press

The Press primitive provides utilities for handling press interactions, specifically for composing event handlers.

## Installation

```bash
npx shadniwind@latest add press
```

## Usage

### composeEventHandlers

Merges a user-provided event handler with an internal one.

```tsx
import { composeEventHandlers } from "~/components/primitives/press";

function MyComponent({ onPress }) {
  const handlePress = composeEventHandlers(onPress, (event) => {
    console.log("Internal handler");
  });

  return <Button onPress={handlePress} />;
}
```

## API Reference

### composeEventHandlers

```ts
function composeEventHandlers<E>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  options?: { checkForDefaultPrevented?: boolean }
): (event: E) => void
```

- **originalEventHandler**: The handler passed from props (optional).
- **ourEventHandler**: The handler defined by the component (optional).
- **options.checkForDefaultPrevented**: If true (default), `ourEventHandler` will not run if `originalEventHandler` calls `event.preventDefault()`.
