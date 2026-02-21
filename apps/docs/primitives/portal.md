# Portal

The Portal primitive allows you to render content outside of the current component hierarchy, which is useful for overlays like modals, tooltips, and toasts.

## Installation

```bash
npx shadcn@latest add @shadniwind/portal
```

## Usage

### 1. Wrap your app in `PortalProvider` and add a `PortalHost`

The `PortalProvider` manages the state of all portals. The `PortalHost` is where the content will be rendered.

```tsx
// _layout.tsx (or App.tsx)
import { PortalProvider, PortalHost } from "~/components/primitives/portal";

export default function RootLayout() {
  return (
    <PortalProvider>
      <Slot />
      {/* 
        The "root" host is typically used for global overlays.
        pointerEvents="box-none" allows touches to pass through when empty.
      */}
      <PortalHost name="root" />
    </PortalProvider>
  );
}
```

### 2. Render content into the Portal

Use the `Portal` component to teleport content to a host.

```tsx
import { Portal } from "~/components/primitives/portal";
import { View, Text } from "react-native";

export function MyComponent() {
  return (
    <View>
      <Text>Main Content</Text>
      
      <Portal name="root">
        <View style={{ position: 'absolute', top: 100, left: 100, backgroundColor: 'red', padding: 20 }}>
           <Text>I am floating!</Text>
        </View>
      </Portal>
    </View>
  );
}
```

## API Reference

### Portal

Renders its children into a `PortalHost`.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | `"root"` | The name of the host to render into. |
| `children` | `ReactNode` | - | The content to render. |

### PortalHost

A container (View) that renders content mounted by `Portal` components.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | `"root"` | Unique identifier for this host. |
| `pointerEvents` | `ViewProps['pointerEvents']` | `"box-none"` | Pass-through setting for touch events. |
| `...ViewProps` | | | Inherits all standard View props. |

### PortalProvider

Context provider for the portal system.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `children` | `ReactNode` | - | App content. |

## Multiple Hosts

You can have multiple hosts for different layers (e.g., "modal", "tooltip").

```tsx
<PortalProvider>
  <View style={{ flex: 1 }}>
     <Slot />
  </View>
  
  {/* Tooltips layer (below modals) */}
  <PortalHost name="tooltip" />
  
  {/* Modals layer (topmost) */}
  <PortalHost name="modal" />
</PortalProvider>
```
