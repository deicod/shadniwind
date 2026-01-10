# Resizable

Accessible resizable panel groups and layouts with keyboard support.

## Installation

```bash
npx shadniwind@latest add resizable
```

## Usage

```tsx
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable"
import { Text, View } from "react-native"

export default function ResizableDemo() {
  return (
    <ResizablePanelGroup direction="horizontal" style={{ height: 200 }}>
      <ResizablePanel defaultSize={50} style={{ backgroundColor: 'pink', padding: 10 }}>
        <Text>One</Text>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50} style={{ backgroundColor: 'lightblue', padding: 10 }}>
        <Text>Two</Text>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
```

## API Reference

### ResizablePanelGroup

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `direction` | `"horizontal" \| "vertical"` | `"horizontal"` | Layout direction of panels. |
| `sizes` | `number[]` | - | Controlled sizes (percentages). |
| `defaultSizes` | `number[]` | - | Default sizes (percentages). |
| `onSizesChange` | `(sizes: number[]) => void` | - | Callback when sizes change. |

### ResizablePanel

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `defaultSize` | `number` | - | Initial size percentage. |
| `minSize` | `number` | - | Minimum size percentage. |
| `maxSize` | `number` | - | Maximum size percentage. |

### ResizableHandle

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `withHandle` | `boolean` | `false` | proper to show a small visual grip handle. |
| `disabled` | `boolean` | `false` | Disables resizing. |
