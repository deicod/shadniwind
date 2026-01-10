# Carousel

A carousel with motion and swipe built using React Native ScrollView.

## Installation

```bash
npx shadniwind@latest add carousel
```

## Usage

```tsx
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel"
import { Card, CardContent } from "~/components/ui/card"
import { Text, View } from "react-native"

<Carousel className="w-full max-w-xs">
  <CarouselContent>
    {Array.from({ length: 5 }).map((_, index) => (
      <CarouselItem key={index}>
        <View className="p-1">
          <Card>
            <CardContent className="flex aspect-square items-center justify-center p-6">
              <Text className="text-4xl font-semibold">{index + 1}</Text>
            </CardContent>
          </Card>
        </View>
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
```

## API Reference

### Carousel

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `orientation` | `"horizontal" \| "vertical"` | "horizontal" | The orientation of the carousel. |
| `loop` | `boolean` | `false` | Whether the carousel should loop. |
| `index` | `number` | - | The controlled index of the carousel. |
| `defaultIndex` | `number` | `0` | The default index of the carousel. |
| `onIndexChange` | `(index: number) => void` | - | Event handler called when the index changes. |
| `itemSize` | `number` | - | The size of each item (width for horizontal, height for vertical). Defaults to container size. |
| `itemSpacing` | `number` | `0` | The spacing between items. |

### CarouselContent

The container for the carousel items.

### CarouselItem

A single item in the carousel.

### CarouselPrevious

A button to scroll to the previous item.

### CarouselNext

A button to scroll to the next item.
