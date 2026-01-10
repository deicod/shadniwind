# Input OTP

Accessible one-time password component with copy paste support.

## Installation

```bash
npx shadniwind@latest add input-otp
```

## Usage

```tsx
import { InputOTP } from "~/components/ui/input-otp"
import * as React from "react"
import { View } from "react-native"

export default function InputOTPDemo() {
  const [value, setValue] = React.useState("")

  return (
    <View className="items-center justify-center p-4">
      <InputOTP
        length={6}
        value={value}
        onChangeText={setValue}
      />
    </View>
  )
}
```

## API Reference

### InputOTP

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `length` | `number` | `6` | The number of characters in the OTP. |
| `value` | `string` | - | The controlled value. |
| `defaultValue` | `string` | - | The default value. |
| `onChangeText` | `(text: string) => void` | - | Callback when value changes. |
| `disabled` | `boolean` | `false` | Whether the input is disabled. |
| `placeholder` | `string` | - | The placeholder character. |
| `separator` | `string` | - | Character to display between groups (at 50%). |
