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

## Getting Started

Follow these steps to initialize a new project with shadniwind.

### 1. Create a Project
Because shadniwind uses native dependencies (`react-native-nitro-modules`, `react-native-edge-to-edge`), you must use a **Development Build**. Expo Go is not supported.

Create a new Expo project:
```bash
npx create-expo-app@latest my-app
cd my-app
npx expo run:ios  # or run:android
```

### 2. Configure `components.json`
The `components.json` file tells the shadcn CLI how to install components. Create this file in your project root:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "",
    "baseColor": "zinc",
    "cssVariables": false
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {
    "shadniwind": "https://deicod.github.io/shadniwind/v1/registry.json"
  }
}
```

**Key setting:** The `registries` field points to the shadniwind registry.

### 3. Install Core Dependencies (Tokens)
Install the `tokens` package. This sets up the base theme (colors, spacing, typography) and the styling engine configuration.

```bash
npx shadcn@latest add tokens
```
*Note: This will install `react-native-unistyles` and create `lib/tokens.ts` and `lib/unistyles.ts`.*

### 4. Initialize Styling
You must initialize the styling system **before** your app renders. Import `lib/unistyles` at the very top of your entry file.

**For Expo Router (`app/_layout.tsx`):**
```tsx
import '@/lib/unistyles'; // <-- MUST be the first import
import { Slot } from 'expo-router';

export default function RootLayout() {
  return <Slot />;
}
```

**For Bare React Native (`App.tsx`):**
```tsx
import '@/lib/unistyles'; // <-- MUST be the first import
import React from 'react';
// ...
```

### 5. Setup Overlay System
Install the `portal` primitive. This is required for components that float above your content, like Dialogs, Popovers, and Tooltips.

```bash
npx shadcn@latest add portal
```

### 6. Wrap Your App
Wrap your application root with `PortalProvider` and add a `PortalHost`.

**For Expo Router (`app/_layout.tsx`):**
```tsx
import '@/lib/unistyles';
import { PortalProvider, PortalHost } from '@/lib/portal';
import { Slot } from 'expo-router';

export default function RootLayout() {
  return (
    <PortalProvider>
      <Slot />
      <PortalHost />
    </PortalProvider>
  );
}
```

### 7. You're Ready!
You can now start adding components:

```bash
npx shadcn@latest add button
```

Then use it in your code:
```tsx
import { Button, ButtonText } from '@/components/ui/button';

export function HomeScreen() {
  return (
    <Button onPress={() => console.log('Pressed!')}>
      <ButtonText>Hello World</ButtonText>
    </Button>
  );
}
```
