import * as React from "react"
import {
  Platform,
  Pressable,
  type PressableProps,
  Text,
  type TextProps,
  type View,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"
import { Calendar, type CalendarProps } from "./calendar.js"
import {
  Popover,
  PopoverContent,
  type PopoverContentProps,
  PopoverTrigger,
} from "./popover.js"

type DatePickerContextValue = {
  value?: Date
  onValueChange: (date?: Date) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  month: Date
  onMonthChange: (month: Date) => void
  locale?: string | string[]
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6
  showOutsideDays: boolean
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  disabledDates?: (date: Date) => boolean
  formatDate: (date: Date) => string
}

const DatePickerContext = React.createContext<DatePickerContextValue | undefined>(
  undefined,
)

function useDatePicker() {
  const context = React.useContext(DatePickerContext)
  if (!context) {
    throw new Error("DatePicker components must be used within DatePicker")
  }
  return context
}

function startOfMonth(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  next.setDate(1)
  return next
}

function isSameMonth(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth()
  )
}

export type DatePickerProps = {
  children: React.ReactNode
  value?: Date
  defaultValue?: Date
  onValueChange?: (date?: Date) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  month?: Date
  defaultMonth?: Date
  onMonthChange?: (month: Date) => void
  locale?: string | string[]
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  showOutsideDays?: boolean
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  disabledDates?: (date: Date) => boolean
  format?: (date: Date) => string
  modal?: boolean
}

export function DatePicker({
  children,
  value: valueProp,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  month: monthProp,
  defaultMonth,
  onMonthChange,
  locale,
  weekStartsOn = 0,
  showOutsideDays = true,
  disabled,
  minDate,
  maxDate,
  disabledDates,
  format,
  modal = false,
}: DatePickerProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<
    Date | undefined
  >(valueProp ?? defaultValue)
  const isValueControlled = valueProp !== undefined
  const currentValue = isValueControlled ? valueProp : uncontrolledValue

  const [open, setOpen] = React.useState(defaultOpen)
  const isOpenControlled = openProp !== undefined
  const currentOpen = isOpenControlled ? openProp : open

  const initialMonth = React.useMemo(() => {
    const base = monthProp ?? defaultMonth ?? currentValue ?? new Date()
    return startOfMonth(base)
  }, [currentValue, defaultMonth, monthProp])

  const [uncontrolledMonth, setUncontrolledMonth] =
    React.useState<Date>(initialMonth)
  const isMonthControlled = monthProp !== undefined
  const currentMonth = startOfMonth(isMonthControlled ? monthProp : uncontrolledMonth)

  const handleValueChange = React.useCallback(
    (nextDate?: Date) => {
      if (!isValueControlled) {
        setUncontrolledValue(nextDate)
      }
      onValueChange?.(nextDate)
    },
    [isValueControlled, onValueChange],
  )

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isOpenControlled) {
        setOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isOpenControlled, onOpenChange],
  )

  const handleMonthChange = React.useCallback(
    (nextMonth: Date) => {
      const normalized = startOfMonth(nextMonth)
      if (!isMonthControlled) {
        setUncontrolledMonth(normalized)
      }
      onMonthChange?.(normalized)
    },
    [isMonthControlled, onMonthChange],
  )

  React.useEffect(() => {
    if (!isMonthControlled && currentValue) {
      if (!isSameMonth(currentValue, currentMonth)) {
        handleMonthChange(currentValue)
      }
    }
  }, [currentMonth, currentValue, handleMonthChange, isMonthControlled])

  React.useEffect(() => {
    if (disabled && currentOpen) {
      handleOpenChange(false)
    }
  }, [currentOpen, disabled, handleOpenChange])

  const formatDate = React.useCallback(
    (date: Date) => {
      if (format) return format(date)
      const formatter = new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
      return formatter.format(date)
    },
    [format, locale],
  )

  return (
    <DatePickerContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        open: !!currentOpen,
        onOpenChange: handleOpenChange,
        month: currentMonth,
        onMonthChange: handleMonthChange,
        locale,
        weekStartsOn,
        showOutsideDays,
        disabled,
        minDate,
        maxDate,
        disabledDates,
        formatDate,
      }}
    >
      <Popover open={currentOpen} onOpenChange={handleOpenChange} modal={modal}>
        {children}
      </Popover>
    </DatePickerContext.Provider>
  )
}

export type DatePickerTriggerProps = PressableProps & {
  asChild?: boolean
  onKeyDown?: (event: unknown) => void
}

export const DatePickerTrigger = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  DatePickerTriggerProps
>(
  (
    {
      children,
      asChild,
      onPress,
      onFocus,
      onBlur,
      onKeyDown,
      disabled,
      style,
      ...props
    },
    ref,
  ) => {
    const { open, onOpenChange, disabled: pickerDisabled } = useDatePicker()
    const isDisabled = !!(disabled || pickerDisabled)
    const variantStyles = styles.useVariants({
      open,
      disabled: isDisabled,
    })

    const handleKeyDown = React.useCallback(
      // biome-ignore lint/suspicious/noExplicitAny: Web-only keyboard event type
      (event: any) => {
        if (Platform.OS !== "web" || isDisabled) return
        if (event.key === " " || event.key === "Enter" || event.key === "ArrowDown") {
          event.preventDefault()
          onOpenChange(true)
        }
        onKeyDown?.(event)
      },
      [isDisabled, onKeyDown, onOpenChange],
    )

    const handleFocus = React.useCallback(
      (event: unknown) => {
        // @ts-expect-error - React Native event type
        onFocus?.(event)
      },
      [onFocus],
    )

    const handleBlur = React.useCallback(
      (event: unknown) => {
        // @ts-expect-error - React Native event type
        onBlur?.(event)
      },
      [onBlur],
    )

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{
        onFocus?: (event: unknown) => void
        onBlur?: (event: unknown) => void
        onKeyDown?: (event: unknown) => void
      }>
      const childOnFocus = child.props.onFocus
      const childOnBlur = child.props.onBlur
      const childOnKeyDown = child.props.onKeyDown
      return (
        <PopoverTrigger
          ref={ref}
          asChild
          disabled={isDisabled}
          onPress={onPress}
          {...props}
        >
          {React.cloneElement(
            child as React.ReactElement<Record<string, unknown>>,
            {
              onFocus: composeEventHandlers(childOnFocus, handleFocus),
              onBlur: composeEventHandlers(childOnBlur, handleBlur),
              onKeyDown:
                Platform.OS === "web"
                  ? composeEventHandlers(childOnKeyDown, handleKeyDown)
                  : childOnKeyDown,
              role: Platform.OS === "web" ? "button" : undefined,
              "aria-expanded": Platform.OS === "web" ? open : undefined,
              "aria-haspopup": Platform.OS === "web" ? "dialog" : undefined,
              accessibilityRole: "button",
              accessibilityState: {
                expanded: open,
                disabled: isDisabled,
              },
              disabled: isDisabled,
            },
          )}
        </PopoverTrigger>
      )
    }

    return (
      <PopoverTrigger ref={ref} asChild disabled={isDisabled} onPress={onPress} {...props}>
        <Pressable
          role={Platform.OS === "web" ? "button" : undefined}
          aria-expanded={Platform.OS === "web" ? open : undefined}
          aria-haspopup={Platform.OS === "web" ? "dialog" : undefined}
          accessibilityRole="button"
          accessibilityState={{
            expanded: open,
            disabled: isDisabled,
          }}
          disabled={isDisabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          // @ts-expect-error - onKeyDown is web-only
          onKeyDown={Platform.OS === "web" ? handleKeyDown : undefined}
          style={({ pressed }) =>
            [
              styles.trigger,
              variantStyles,
              pressed && !isDisabled && styles.triggerPressed,
              typeof style === "function" ? style({ pressed }) : style,
              // biome-ignore lint/suspicious/noExplicitAny: Complex style array with variants requires type assertion
            ] as any
          }
        >
          {children ?? <DatePickerValue />}
        </Pressable>
      </PopoverTrigger>
    )
  },
)

DatePickerTrigger.displayName = "DatePickerTrigger"

export type DatePickerValueProps = TextProps & {
  placeholder?: string
  format?: (date: Date) => string
}

export const DatePickerValue = React.forwardRef<Text, DatePickerValueProps>(
  ({ placeholder = "Pick a date", format, style, children, ...props }, ref) => {
    const { value, formatDate, disabled } = useDatePicker()
    const hasCustomChildren = children !== undefined && children !== null
    const formatted = value ? (format ?? formatDate)(value) : undefined
    const displayValue = hasCustomChildren ? children : formatted
    const isPlaceholder = displayValue === undefined || displayValue === null

    return (
      <Text
        ref={ref}
        style={[
          styles.value,
          isPlaceholder && styles.valuePlaceholder,
          disabled && styles.valueDisabled,
          style,
        ]}
        {...props}
      >
        {isPlaceholder ? placeholder : displayValue}
      </Text>
    )
  },
)

DatePickerValue.displayName = "DatePickerValue"

export type DatePickerContentProps = PopoverContentProps

export const DatePickerContent = React.forwardRef<View, DatePickerContentProps>(
  ({ align = "start", style, ...props }, ref) => {
    return (
      <PopoverContent
        ref={ref}
        align={align}
        style={[styles.content, style]}
        {...props}
      />
    )
  },
)

DatePickerContent.displayName = "DatePickerContent"

export type DatePickerCalendarProps = Omit<
  CalendarProps,
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "month"
  | "defaultMonth"
  | "onMonthChange"
  | "locale"
  | "weekStartsOn"
  | "showOutsideDays"
  | "disabled"
  | "minDate"
  | "maxDate"
  | "disabledDates"
> & {
  closeOnSelect?: boolean
}

export const DatePickerCalendar = React.forwardRef<View, DatePickerCalendarProps>(
  ({ closeOnSelect = true, style, ...props }, ref) => {
    const {
      value,
      onValueChange,
      onOpenChange,
      month,
      onMonthChange,
      locale,
      weekStartsOn,
      showOutsideDays,
      disabled,
      minDate,
      maxDate,
      disabledDates,
    } = useDatePicker()

    const handleValueChange = React.useCallback(
      (nextDate?: Date) => {
        onValueChange(nextDate)
        if (closeOnSelect) {
          onOpenChange(false)
        }
      },
      [closeOnSelect, onOpenChange, onValueChange],
    )

    return (
      <Calendar
        ref={ref}
        value={value}
        onValueChange={handleValueChange}
        month={month}
        onMonthChange={onMonthChange}
        locale={locale}
        weekStartsOn={weekStartsOn}
        showOutsideDays={showOutsideDays}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        disabledDates={disabledDates}
        role={Platform.OS === "web" ? "grid" : undefined}
        style={[styles.calendar, style]}
        {...props}
      />
    )
  },
)

DatePickerCalendar.displayName = "DatePickerCalendar"

function composeEventHandlers<E>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {},
) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event)

    if (
      checkForDefaultPrevented === false ||
      !(event as unknown as { defaultPrevented: boolean })?.defaultPrevented
    ) {
      return ourEventHandler?.(event)
    }
  }
}

const styles = StyleSheet.create((theme) => ({
  trigger: {
    minHeight: theme.spacing[10],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.input,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing[3],
    justifyContent: "center",
    variants: {
      open: {
        true: {
          borderColor: theme.colors.ring,
          shadowColor: theme.colors.ring,
          shadowOpacity: 0.35,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 0 },
        },
      },
      disabled: {
        true: {
          opacity: 0.5,
        },
      },
    },
  },
  triggerPressed: {
    backgroundColor: theme.colors.muted,
  },
  value: {
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    color: theme.colors.foreground,
  },
  valuePlaceholder: {
    color: theme.colors.mutedForeground,
  },
  valueDisabled: {
    color: theme.colors.mutedForeground,
  },
  content: {
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  calendar: {
    borderWidth: 0,
  },
}))
