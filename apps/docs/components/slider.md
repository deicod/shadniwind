# Slider

An input where the user selects a value from within a given range.

## Installation

```bash
npx shadniwind@latest add slider
```

## Usage

```tsx
import { Slider } from "~/components/ui/slider"

// Single value
<Slider defaultValue={50} max={100} step={1} />

// Multiple thumbs (range)
<Slider defaultValue={[25, 75]} max={100} step={1} />
```

## API Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `number \| number[]` | - | The controlled value. |
| `defaultValue` | `number \| number[]` | `0` | The initial value. |
| `min` | `number` | `0` | The minimum value. |
| `max` | `number` | `100` | The maximum value. |
| `step` | `number` | `1` | The stepping interval. |
| `onValueChange` | `(value: number \| number[]) => void` | - | Event handler when value changes. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | The size of the track and thumb. |
