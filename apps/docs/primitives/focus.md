# Focus

The Focus primitive manages focus traversal within a container. It allows for focus trapping (keeping focus within the container) and looping (cycling focus from last to first element).

## Installation

```bash
npx shadniwind@latest add focus
```

## Usage

Use the `FocusScope` component to wrap elements that should share a focus context.

```tsx
import { FocusScope } from "~/components/primitives/focus";
import { View, Button } from "react-native";

export function ModalContent() {
  return (
    <FocusScope trapped loop>
      <View>
        <Button title="First" onPress={() => {}} />
        <Button title="Second" onPress={() => {}} />
        <Button title="Close" onPress={() => {}} />
      </View>
    </FocusScope>
  );
}
```

## API Reference

### FocusScope

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `trapped` | `boolean` | `false` | If true, focus is locked within the scope (Web only). |
| `loop` | `boolean` | `false` | If true, tabbing from the last item moves to the first (Web only). |
| `onMountAutoFocus` | `(event: Event) => void` | - | Event handler called when the scope mounts. Call `event.preventDefault()` to skip auto-focus. |
| `onUnmountAutoFocus` | `(event: Event) => void` | - | Event handler called when the scope unmounts. Call `event.preventDefault()` to skip restoring focus. |
