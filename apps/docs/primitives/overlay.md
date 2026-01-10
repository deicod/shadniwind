# Overlay

The Overlay primitive provides a layer that sits on top of other content. It handles common overlay behaviors like backdrops (scrims), dismissing on outside clicks, Escape key presses (Web), and hardware back button presses (Android).

## Installation

```bash
npx shadniwind@latest add overlay
```

## Usage

Use the `Overlay` component to wrap content that should be dismissable.

```tsx
import { Overlay } from "~/components/primitives/overlay";
import { View, Text } from "react-native";

export function MyModal({ onClose }) {
  return (
    <Overlay 
      scrim 
      dismissable 
      onDismiss={onClose}
    >
      <View style={{ backgroundColor: 'white', padding: 20 }}>
        <Text>Modal Content</Text>
      </View>
    </Overlay>
  );
}
```

## API Reference

### Overlay

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `scrim` | `boolean` | `true` | Whether to show a darkened backdrop. |
| `visible` | `boolean` | `true` | Visibility of the overlay. |
| `dismissable` | `boolean` | `true` | Whether the overlay can be dismissed by user interaction. |
| `onDismiss` | `() => void` | - | Callback when the overlay is dismissed (click outside, Esc, Back button). |
| `scrimStyle` | `StyleProp<ViewStyle>` | - | Custom styles for the backdrop. |
| `scrimProps` | `PressableProps` | - | Props passed to the backdrop Pressable. |
