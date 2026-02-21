# Positioning

The Positioning primitive handles the logic for placing floating content (like popovers, tooltips, and dropdowns) relative to an anchor element. It includes collision detection and flipping to ensure content remains visible.

## Installation

```bash
npx shadcn@latest add @shadniwind/positioning
```

## Usage

This primitive is primarily used via the `usePositioning` hook.

```tsx
import type { View } from "react-native";
import { useRef } from "react";
import { usePositioning } from "~/components/primitives/positioning";

export function MyComponent() {
  const anchorRef = useRef<View>(null);
  const contentRef = useRef<View>(null);
  const [open, setOpen] = useState(false);

  const { position, actualPlacement, isPositioned } = usePositioning({
    anchorRef,
    contentRef,
    placement: "bottom",
    offset: 8,
    flip: true,
    open,
  });

  return (
    <>
      <View ref={anchorRef}>
         <Text>Anchor</Text>
      </View>
      
      {open && (
        <View 
          ref={contentRef}
          style={{
            position: "absolute",
            top: position.top,
            left: position.left,
            opacity: isPositioned ? 1 : 0, 
          }}
        >
          <Text>Floating Content</Text>
        </View>
      )}
    </>
  );
}
```

## API Reference

### usePositioning

Hook to calculate the position of floating content.

#### Options

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `anchorRef` | `RefObject<View>` | **Required** | Ref to the trigger/anchor element. |
| `contentRef` | `RefObject<View>` | **Required** | Ref to the content element to be positioned. |
| `placement` | `Placement` | `"bottom"` | Preferred placement (e.g., "top", "bottom-start"). |
| `offset` | `number` | `8` | Distance in pixels between anchor and content. |
| `alignOffset` | `number` | `0` | Additional offset along the cross axis. |
| `flip` | `boolean` | `true` | Whether to flip placement if content collides with viewport edges. |
| `collisionPadding` | `number` | `8` | Padding from viewport edges. |
| `open` | `boolean` | `true` | When false, stops measuring. |

#### Returns

| Property | Type | Description |
| :--- | :--- | :--- |
| `position` | `{ top: number, left: number }` | The calculated coordinates. |
| `actualPlacement` | `Placement` | The final placement (may differ from requested if flipped). |
| `isPositioned` | `boolean` | True when valid measurements have been made. |
| `update` | `() => void` | Function to manually trigger a re-measurement. |

### Types

#### Placement
`"top"` | `"top-start"` | `"top-end"` | `"bottom"` | `"bottom-start"` | `"bottom-end"` | `"left"` | `"left-start"` | `"left-end"` | `"right"` | `"right-start"` | `"right-end"`
