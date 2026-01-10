# Aspect Ratio

Displays content within a desired ratio.

## Installation

```bash
npx shadniwind@latest add aspect-ratio
```

## Usage

```tsx
import { AspectRatio } from "~/components/ui/aspect-ratio"
import { Image } from "react-native"

<AspectRatio ratio={16 / 9}>
  <Image 
    source={{ uri: "..." }} 
    style={{ flex: 1, width: undefined, height: undefined }} 
  />
</AspectRatio>
```

## Presets

You can use string presets for common ratios:

```tsx
<AspectRatio ratio="16:9">...</AspectRatio>
<AspectRatio ratio="4:3">...</AspectRatio>
<AspectRatio ratio="1:1">...</AspectRatio>
```

## API Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `ratio` | `number \| "1:1" \| "16:9" \| "4:3" \| "3:2" \| "21:9"` | `1` | The aspect ratio to enforce. |
