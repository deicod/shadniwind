import * as React from "react"
import { View, type ViewProps } from "react-native"
import { StyleSheet } from "react-native-unistyles"
import {
  FormControl,
  FormDescription,
  FormLabel,
  type FormLabelProps,
  FormMessage,
} from "./form-core.js"

export type FieldProps = ViewProps & {
  /**
   * Field label
   */
  label?: string
  /**
   * Helper/description text
   */
  description?: string
  /**
   * Error message to display
   */
  error?: string
  /**
   * Info message to display
   */
  info?: string
  /**
   * Whether the field is required
   */
  required?: boolean
  /**
   * Whether the field is disabled
   */
  disabled?: boolean
  /**
   * Label props passthrough
   */
  labelProps?: Omit<FormLabelProps, "required" | "disabled">
}

/**
 * Field component - high-level wrapper combining label, control, description, and messages.
 *
 * This is a presentational wrapper built on Form Core components.
 * Use for consistent field layout in forms.
 *
 * **Note:** This is presentational only - no state management or validation.
 * Use with form libraries like react-hook-form.
 *
 * @example
 * ```tsx
 * <Field
 *   label="Email"
 *   description="We'll never share your email"
 *   required
 *   error={errors.email?.message}
 * >
 *   <Input placeholder="Enter email" />
 * </Field>
 * ```
 */
export const Field = React.forwardRef<
  React.ComponentRef<typeof View>,
  FieldProps
>(
  (
    {
      label,
      description,
      error,
      info,
      required,
      disabled,
      labelProps,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <View ref={ref} style={[styles.field, style]} {...props}>
        {label && (
          <FormLabel required={required} disabled={disabled} {...labelProps}>
            {label}
          </FormLabel>
        )}

        {description && <FormDescription>{description}</FormDescription>}

        <FormControl>{children}</FormControl>

        {error && <FormMessage type="error">{error}</FormMessage>}
        {!error && info && <FormMessage type="info">{info}</FormMessage>}
      </View>
    )
  },
)

Field.displayName = "Field"

const styles = StyleSheet.create((_theme) => ({
  field: {
    marginBottom: 16,
  },
}))
