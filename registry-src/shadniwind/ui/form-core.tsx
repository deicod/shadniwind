import * as React from "react"
import { Text, View, type ViewProps } from "react-native"
import { StyleSheet } from "react-native-unistyles"

/**
 * Form Core - Presentational form layout components.
 *
 * **Important:** This is a presentational layer only.
 * - No form state management
 * - No validation logic
 * - Use with form libraries like react-hook-form, formik, etc.
 *
 * Provides consistent spacing, labels, error display, and descriptions.
 */

export type FormFieldProps = ViewProps

/**
 * Form field wrapper providing consistent spacing.
 */
export const FormField = React.forwardRef<
  React.ComponentRef<typeof View>,
  FormFieldProps
>(({ style, ...props }, ref) => {
  return <View ref={ref} style={[styles.field, style]} {...props} />
})

FormField.displayName = "FormField"

export type FormLabelProps = ViewProps & {
  /**
   * Whether the field is required
   */
  required?: boolean
  /**
   * Whether the field is disabled
   */
  disabled?: boolean
}

/**
 * Form label component.
 */
export const FormLabel = React.forwardRef<
  React.ComponentRef<typeof View>,
  FormLabelProps
>(({ required, disabled, style, children, ...props }, ref) => {
  return (
    <View
      ref={ref}
      style={[styles.label, disabled && styles.labelDisabled, style]}
      {...props}
    >
      {typeof children === "string" ? (
        <Text style={[styles.labelText, disabled && styles.labelTextDisabled]}>
          {children}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      ) : (
        <>
          {children}
          {required && <Text style={styles.required}> *</Text>}
        </>
      )}
    </View>
  )
})

FormLabel.displayName = "FormLabel"

export type FormDescriptionProps = ViewProps

/**
 * Form field description (helper text).
 */
export const FormDescription = React.forwardRef<
  React.ComponentRef<typeof View>,
  FormDescriptionProps
>(({ style, children, ...props }, ref) => {
  return (
    <View ref={ref} style={[styles.description, style]} {...props}>
      {typeof children === "string" ? (
        <Text style={styles.descriptionText}>{children}</Text>
      ) : (
        children
      )}
    </View>
  )
})

FormDescription.displayName = "FormDescription"

export type FormMessageProps = ViewProps & {
  /**
   * Type of message (error or info)
   * @default "error"
   */
  type?: "error" | "info"
}

/**
 * Form field message (errors or info).
 */
export const FormMessage = React.forwardRef<
  React.ComponentRef<typeof View>,
  FormMessageProps
>(({ type = "error", style, children, ...props }, ref) => {
  return (
    <View ref={ref} style={[styles.message, style]} {...props}>
      {typeof children === "string" ? (
        <Text
          style={[
            styles.messageText,
            type === "error" && styles.messageTextError,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  )
})

FormMessage.displayName = "FormMessage"

export type FormControlProps = ViewProps

/**
 * Form control wrapper for inputs.
 * Provides consistent spacing between label and input.
 */
export const FormControl = React.forwardRef<
  React.ComponentRef<typeof View>,
  FormControlProps
>(({ style, ...props }, ref) => {
  return <View ref={ref} style={[styles.control, style]} {...props} />
})

FormControl.displayName = "FormControl"

const styles = StyleSheet.create((theme) => ({
  field: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
  },
  labelDisabled: {
    opacity: 0.5,
  },
  labelText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.foreground,
  },
  labelTextDisabled: {
    color: theme.colors.mutedForeground,
  },
  required: {
    color: theme.colors.destructive,
  },
  description: {
    marginTop: 4,
  },
  descriptionText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.mutedForeground,
  },
  message: {
    marginTop: 4,
  },
  messageText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.mutedForeground,
  },
  messageTextError: {
    color: theme.colors.destructive,
  },
  control: {
    // Spacing for control wrapper
  },
}))
