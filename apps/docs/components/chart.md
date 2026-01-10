# Chart

Beautiful charts. Built using `react-native-svg`.

## Installation

```bash
npx shadniwind@latest add chart
```

## Usage

```tsx
import { Chart } from "~/components/ui/chart"

const data = [
  { month: "Jan", sales: 4000, profit: 2400 },
  { month: "Feb", sales: 3000, profit: 1398 },
  { month: "Mar", sales: 2000, profit: 9800 },
  { month: "Apr", sales: 2780, profit: 3908 },
  { month: "May", sales: 1890, profit: 4800 },
  { month: "Jun", sales: 2390, profit: 3800 },
]

const series = [
  { id: "sales", dataKey: "sales", label: "Sales", color: "#8884d8" },
  { id: "profit", dataKey: "profit", label: "Profit", color: "#82ca9d" },
]

<Chart data={data} series={series} />
```

## API Reference

### Chart

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `data` | `ChartDatum[]` | - | The data to display. |
| `series` | `ChartSeries[]` | - | Configuration for the data series. |
| `width` | `number` | - | The width of the chart. Defaults to auto. |
| `height` | `number` | `180` | The height of the chart. |
| `showGrid` | `boolean` | `false` | Whether to show grid lines. |
| `minValue` | `number` | - | The minimum value for the Y-axis. |
| `maxValue` | `number` | - | The maximum value for the Y-axis. |

### ChartSeries

| Prop | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier for the series. |
| `dataKey` | `string` | The key in the data object to access the value. |
| `type` | `"line" \| "bar" \| "area"` | The type of chart for this series. |
| `color` | `string` | The color of the series. |
| `label` | `string` | The label for the legend. |
