# Date Picker

A date field component that allows users to enter and edit date.

## Installation

```bash
npx shadniwind@latest add date-picker
```

## Usage

```tsx
import {
  DatePicker,
  DatePickerContent,
  DatePickerTrigger,
  DatePickerValue,
  DatePickerCalendar,
} from "~/components/ui/date-picker"
import * as React from "react"
import { Text } from "react-native"

export default function DatePickerDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <DatePicker
      value={date}
      onValueChange={setDate}
      minDate={new Date(2023, 0, 1)}
    >
      <DatePickerTrigger>
        <DatePickerValue placeholder="Select a date" />
      </DatePickerTrigger>
      <DatePickerContent>
        <DatePickerCalendar />
      </DatePickerContent>
    </DatePicker>
  )
}
```

## API Reference

### DatePicker

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `Date` | - | The controlled selected date. |
| `onValueChange` | `(date?: Date) => void` | - | Event handler called when the selected date changes. |
| `open` | `boolean` | - | The controlled open state of the popover. |
| `onOpenChange` | `(open: boolean) => void` | - | Event handler called when the open state changes. |
| `disabled` | `boolean` | `false` | Whether the date picker is disabled. |

### DatePickerTrigger

The trigger element for the date picker.

### DatePickerValue

Displays the selected date or a placeholder.

### DatePickerContent

The popover content containing the calendar.

### DatePickerCalendar

The calendar component to display inside the content.
