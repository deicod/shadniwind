# Form

Building forms with React Hook Form, TanStack Form, or natively.

## Installation

```bash
npx shadcn@latest add @shadniwind/form-rhf
```

Optional variants:

```bash
npx shadcn@latest add @shadniwind/form-tsf
npx shadcn@latest add @shadniwind/form-core
```

## Usage

```tsx
import { FormRHFField, FormRHFProvider } from "~/components/ui/form-rhf"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { useForm } from "react-hook-form"
import { Text, View } from "react-native"

export default function FormDemo() {
  const form = useForm({
    defaultValues: {
      username: "",
    },
  })

  function onSubmit(data: any) {
    console.log(data)
  }

  return (
    <FormRHFProvider {...form}>
      <View className="gap-4">
        <FormRHFField
          control={form.control}
          name="username"
          label="Username"
          description="This is your public display name."
          render={({ field }) => (
            <Input
              placeholder="shadcn"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Button onPress={form.handleSubmit(onSubmit)}>
          <Text>Submit</Text>
        </Button>
      </View>
    </FormRHFProvider>
  )
}
```

## API Reference

### Form Core

Primitive components for building custom forms.

- `FormField`: Wrapper for form fields.
- `FormLabel`: Label component.
- `FormControl`: Wrapper for the input control.
- `FormDescription`: Helper text.
- `FormMessage`: Error or info message.

### Form RHF

Helper components for React Hook Form.

- `FormRHFProvider`: Inherits `FormProvider` from `react-hook-form`.
- `FormRHFField`: Wraps `Field` and connects to `react-hook-form`.

### Form TSF

Helper components for TanStack Form.

- `FormTSFField`: Wraps `Field` and connects to `@tanstack/react-form`.
