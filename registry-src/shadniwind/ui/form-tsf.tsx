// @ts-ignore - Optional dependency
import { Field } from "@tanstack/react-form"

import { Field as UIField } from "./field.js"

/**
 * TanStack Form integration for Field component.
 *
 * Provides wrappers for @tanstack/react-form Field with consistent UI.
 *
 * **Important:** Requires `@tanstack/react-form` to be installed.
 *
 * @example
 * ```tsx
 * import { useForm } from '@tanstack/react-form'
 *
 * function LoginForm() {
 *   const form = useForm({
 *     defaultValues: {
 *       email: '',
 *     },
 *     onSubmit: async ({ value }) => {
 *       // ...
 *     },
 *   })
 *
 *   return (
 *     <View>
 *       <FormTSFField
 *         form={form}
 *         name="email"
 *         label="Email"
 *       >
 *         {(field) => (
 *           <Input
 *             value={field.state.value}
 *             onBlur={field.handleBlur}
 *             onChangeText={(text) => field.handleChange(text)}
 *           />
 *         )}
 *       </FormTSFField>
 *     </View>
 *   )
 * }
 * ```
 */

// NOTE: Types are currently loose (any) to avoid strict dependency on @tanstack/react-form types
// which may not be present in the user's environment.

/**
 * Wrapper around TanStack Form's Field component that integrates with our UI Field.
 *
 * NOTE: Due to the complexity of TanStack Form's generics, this wrapper
 * uses simplified types. For Full type safety, usage of `<form.Field>` directly
 * with our `<Field>` component may be preferred in complex cases.
 */
export function FormTSFField(props: any) {
  const {
    label,
    description,
    info,
    required,
    disabled,
    labelProps,
    children,
    ...fieldProps
  } = props

  return (
    <Field {...fieldProps}>
      {(field: any) => {
        // TanStack Form errors can be arrays or strings
        const errorMap = field.state.meta.errors
        const errorMessage = Array.isArray(errorMap)
          ? errorMap.join(", ")
          : errorMap?.toString()

        return (
          <UIField
            label={label}
            description={description}
            error={errorMessage}
            info={info}
            required={required}
            disabled={disabled}
            labelProps={labelProps}
          >
            {children(field)}
          </UIField>
        )
      }}
    </Field>
  )
}
