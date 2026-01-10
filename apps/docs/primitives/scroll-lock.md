# Scroll Lock

The Scroll Lock primitive prevents the body from scrolling. This is essential for overlays like Modals and Dialogs to prevent the background content from moving while the overlay is open.

## Installation

```bash
npx shadniwind@latest add scroll-lock
```

## Usage

This primitive provides a `useScrollLock` hook.

```tsx
import { useScrollLock } from "~/components/primitives/scroll-lock";
import { useState } from "react";
import { Button, View, Text } from "react-native";

export function Modal() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Lock body scroll when isOpen is true
  useScrollLock(isOpen);

  return (
    <View>
      <Button title="Open" onPress={() => setIsOpen(true)} />
      {isOpen && <Text>Modal Open - Scroll Locked</Text>}
    </View>
  );
}
```

## API Reference

### useScrollLock

| Argument | Type | Description |
| :--- | :--- | :--- |
| `lock` | `boolean` | If true, body scroll is disabled on Web. No-op on Native. |
