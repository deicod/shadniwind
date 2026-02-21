# Scroll Area

Augments native scroll functionality for custom, cross-browser styling.

## Installation

```bash
npx shadcn@latest add @shadniwind/scroll-area
```

## Usage

```tsx
import { ScrollArea } from "~/components/ui/scroll-area"
import { Text, View } from "react-native"

export default function ScrollAreaDemo() {
  return (
    <ScrollArea style={{ height: 200, borderWidth: 1, borderColor: '#ccc' }}>
      <View style={{ padding: 20 }}>
        <Text>
          Jokester began sneaking into the castle in the middle of the night...
        </Text>
      </View>
    </ScrollArea>
  )
}
```

## API Reference

### ScrollArea

A styled wrapper around `ScrollView`. Accepts all `ScrollViewProps`.
