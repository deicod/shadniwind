# Skeleton

Used to show a specific amount of content that is loading.

## Installation

```bash
npx shadcn@latest add @shadniwind/skeleton
```

## Usage

```tsx
import { Skeleton } from "~/components/ui/skeleton"
import { View } from "react-native"

<View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <Skeleton style={{ height: 40, width: 40, borderRadius: 20 }} />
  <View style={{ marginLeft: 8 }}>
    <Skeleton style={{ height: 20, width: 100 }} />
    <Skeleton style={{ height: 20, width: 80, marginTop: 4 }} />
  </View>
</View>
```

## API Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `animate` | `boolean` | `true` | Whether the skeleton should pulse. |
