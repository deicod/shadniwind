# shadniwind

**shadniwind** is a collection of shadcn-style, source-distributed UI components specifically built for **React Native** and **React Native Web**. 

Unlike traditional component libraries, shadniwind components are provided as source code that you own and can customize. It is built from the ground up to leverage the performance and flexibility of **react-native-unistyles v3**.

## Why shadniwind?

- **Source Distributed**: Just like shadcn/ui, you copy the components into your project. You have full control.
- **Unistyles v3**: Leverages the latest Unistyles for high-performance styling, theming, and responsive design.
- **Native-First**: Optimized for React Native (iOS/Android) while maintaining excellent Web support.
- **Nitro-Powered**: Uses `react-native-nitro-modules` for ultra-fast bridge communication.

## Hard Requirements

To use shadniwind, your environment must meet these specifications:

- **React Native 0.78+**: With the New Architecture enabled.
- **Expo SDK 53+**: Using the dev client or prebuild flow. **Expo Go is not supported** due to native dependencies.
- **Dependencies**: 
  - `react-native-nitro-modules`
  - `react-native-edge-to-edge`
  - `react-native-unistyles v3`

## Installation & Setup

Before using any components, follow this initialization order.

> **Note:** These steps assume you have configured `components.json` as described in the section below. If not, use the full URL (e.g., `npx shadcn@latest add https://deicod.github.io/shadniwind/v1/r/tokens.json`).

### 1. Install Tokens
Add the `tokens` registry item to your project. This installs the base theme and Unistyles configuration.

```bash
npx shadcn@latest add tokens
```

### 2. Initialize Unistyles
Import `lib/unistyles` exactly once at the entry point of your application (e.g., `app/_layout.tsx` or `App.tsx`), **before** any component rendering or `StyleSheet.create` calls.

```tsx
// app/_layout.tsx or App.tsx
import '@/lib/unistyles'; // <-- Import this first!
```

### 3. Setup Portal
Install the `portal` registry item. Portals are essential for components like Dialogs, Popovers, and Tooltips.

```bash
npx shadcn@latest add portal
```

### 4. Context Providers
Mount `PortalProvider` and a root `PortalHost` near your application root.

```tsx
import { PortalProvider, PortalHost } from '@/lib/portal';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalProvider>
      {children}
      <PortalHost />
    </PortalProvider>
  );
}
```

Portal host placement guidance:
- Place the root `PortalHost` late in the tree, absolutely positioned, with `pointerEvents="box-none"`.

Default install layout:
- `lib/*` for tokens, Unistyles init, and primitives.
- `components/ui/*` for UI components.

## components.json (consumer configuration)
Add a registry entry pointing at the shadniwind registry endpoint.

Recommended (versioned):
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "registries": {
    "shadniwind": "https://deicod.github.io/shadniwind/v1/registry.json"
  }
}
```

Latest stable alias:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "registries": {
    "shadniwind": "https://deicod.github.io/shadniwind/registry.json"
  }
}
```
