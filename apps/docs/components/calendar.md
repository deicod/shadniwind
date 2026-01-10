# Calendar

A date field component that allows users to enter and edit date.

## Installation

```bash
npx shadniwind@latest add calendar
```

## Usage

```tsx
import { Calendar } from "~/components/ui/calendar"
import * as React from "react"

export default function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <Calendar
      value={date}
      onValueChange={setDate}
      className="rounded-md border"
    />
  )
}
```

## API Reference

### Calendar

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `Date` | - | The controlled selected date. |
| `defaultValue` | `Date` | - | The default selected date. |
| `onValueChange` | `(date?: Date) => void` | - | Event handler called when the selected date changes. |
| `month` | `Date` | - | The controlled month. |
| `defaultMonth` | `Date` | - | The default month. |
| `onMonthChange` | `(month: Date) => void` | - | Event handler called when the month changes. |
| `disabled` | `boolean` | `false` | Whether the calendar is disabled. |
| `minDate` | `Date` | - | The minimum date that can be selected. |
| `maxDate` | `Date` | - | The maximum date that can be selected. |
| `disabledDates` | `(date: Date) => boolean` | - | A function that returns true if a date is disabled. |
| `weekStartsOn` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6` | `0` | The day of the week to start on (0 is Sunday). |
| `weekdayFormat` | `"short" \| "long" \| "narrow"` | `"short"` | The format of the weekday labels. |
