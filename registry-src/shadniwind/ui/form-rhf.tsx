import type * as React from "react"

import {
  type Control,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  type UseFormReturn,
  useController,
} from "react-hook-form"
import { Field, type FieldProps } from "./field.js"

export type FormRHFProviderProps<
  TFieldValues extends FieldValues = FieldValues,
> = UseFormReturn<TFieldValues>

/**
 * React Hook Form integration for Field component.
 *
 * Provides typed wrappers for react-hook-form Controller with Field.
 *
 * **Important:** Requires `react-hook-form` to be installed.
 * Install with: `npm install react-hook-form`
 *
 * @example
 * ```tsx
 * import { useForm } from 'react-hook-form'
 *
 * type FormData = {
 *   email: string
 *   password: string
 * }
 *
 * function LoginForm() {
 *   const form = useForm<FormData>()
 *
 *   return (
 *     <FormRHFProvider {...form}>
 *       <FormRHFField
 *         name="email"
 *         label="Email"
 *         render={({ field }) => (
 *           <Input {...field} placeholder="Enter email" />
 *         )}
 *       />
 *     </FormRHFProvider>
 *   )
 * }
 * ```
 */
export function FormRHFProvider<
  TFieldValues extends FieldValues = FieldValues,
>({
  children,
  ...formMethods
}: FormRHFProviderProps<TFieldValues> & { children: React.ReactNode }) {
  return <FormProvider<TFieldValues> {...formMethods}>{children}</FormProvider>
}

export type FormRHFFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<FieldProps, "error" | "children"> & {
  /**
   * Field name from your form schema
   */
  name: TName
  /**
   * Form control from useForm()
   */
  control?: Control<TFieldValues>
  /**
   * Render function receiving field props
   */
  render: (props: {
    field: ControllerRenderProps<TFieldValues, TName>
  }) => React.ReactElement
}

/**
 * Typed Field component integrated with react-hook-form Controller.
 *
 * Automatically handles:
 * - Field registration
 * - Error display from validation
 * - Value binding
 * - onChange/onBlur handlers
 */
export function FormRHFField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  render,
  label,
  description,
  info,
  required,
  disabled,
  labelProps,
  ...fieldProps
}: FormRHFFieldProps<TFieldValues, TName>) {
  const { field, fieldState } = useController({
    name,
    control,
    disabled,
  })

  return (
    <Field
      label={label}
      description={description}
      error={fieldState.error?.message}
      info={info}
      required={required}
      disabled={disabled}
      labelProps={labelProps}
      {...fieldProps}
    >
      {render({ field })}
    </Field>
  )
}
