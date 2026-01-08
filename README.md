# shadniwind
shadcn-style source-distributed UI components for React Native + React Native Web, built on react-native-unistyles v3.

## Hard requirements
- React Native 0.78+ with New Architecture enabled.
- Expo SDK 53+ with dev client or prebuild flow; not supported on Expo Go.
- Requires `react-native-nitro-modules` and `react-native-edge-to-edge`.
- Configure Unistyles before any `StyleSheet.create` runs; import `lib/unistyles.ts` exactly once at startup.

## Installation contract
Required install order:
1) Install the `tokens` registry item.
2) Import `lib/unistyles.ts` once at app startup before any other code creates stylesheets.
3) Install the `portal` registry item.
4) Mount `PortalProvider` and a root `PortalHost` near the app root.

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
