# Progress

Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.

## Installation

```bash
npx shadcn@latest add @shadniwind/progress
```

## Usage

```tsx
import { Progress } from "~/components/ui/progress"

<Progress value={33} />
```

## API Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `number` | `0` | The progress value. |
| `max` | `number` | `100` | The maximum value. |
| `indeterminate` | `boolean` | `false` | Whether the progress is indeterminate. |
| `indicatorStyle` | `ViewStyle` | - | Style for the inner indicator bar. |
