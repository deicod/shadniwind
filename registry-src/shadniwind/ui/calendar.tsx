import * as React from "react"
import {
  Platform,
  Pressable,
  type PressableProps,
  Text,
  View,
  type ViewProps,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"

type CalendarDay = {
  date: Date
  outside: boolean
}

type WeekdayFormat = "short" | "long" | "narrow"

export type CalendarProps = ViewProps & {
  value?: Date
  defaultValue?: Date
  onValueChange?: (date?: Date) => void
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
  weekdayFormat?: WeekdayFormat
}

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function startOfMonth(date: Date) {
  const next = startOfDay(date)
  next.setDate(1)
  return next
}

function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function addMonths(date: Date, amount: number) {
  const next = new Date(date)
  const dayOfMonth = next.getDate()
  next.setDate(1)
  next.setMonth(next.getMonth() + amount)
  const daysInMonth = new Date(
    next.getFullYear(),
    next.getMonth() + 1,
    0,
  ).getDate()
  next.setDate(Math.min(dayOfMonth, daysInMonth))
  return next
}

function addYears(date: Date, amount: number) {
  const next = new Date(date)
  next.setFullYear(next.getFullYear() + amount)
  return next
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function isSameMonth(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth()
  )
}

function clampDate(date: Date, minDate?: Date, maxDate?: Date) {
  const day = startOfDay(date)
  if (minDate && day < startOfDay(minDate)) {
    return startOfDay(minDate)
  }
  if (maxDate && day > startOfDay(maxDate)) {
    return startOfDay(maxDate)
  }
  return day
}

function getWeekStart(date: Date, weekStartsOn: number) {
  const day = date.getDay()
  const diff = (day - weekStartsOn + 7) % 7
  return addDays(date, -diff)
}

function getWeekEnd(date: Date, weekStartsOn: number) {
  return addDays(getWeekStart(date, weekStartsOn), 6)
}

function getCalendarDays(month: Date, weekStartsOn: number) {
  const start = startOfMonth(month)
  const startOffset = (start.getDay() - weekStartsOn + 7) % 7
  const gridStart = addDays(start, -startOffset)

  const days: CalendarDay[] = []
  for (let i = 0; i < 42; i += 1) {
    const date = addDays(gridStart, i)
    days.push({ date, outside: !isSameMonth(date, start) })
  }

  const weeks: CalendarDay[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
}

export const Calendar = React.forwardRef<View, CalendarProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      month: monthProp,
      defaultMonth,
      onMonthChange,
      locale,
      weekStartsOn = 0,
      showOutsideDays = true,
      disabled = false,
      minDate,
      maxDate,
      disabledDates,
      weekdayFormat = "short",
      style,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState<
      Date | undefined
    >(valueProp ?? defaultValue)
    const isValueControlled = valueProp !== undefined
    const selectedDate = isValueControlled ? valueProp : uncontrolledValue

    const initialMonth = React.useMemo(() => {
      const base = monthProp ?? defaultMonth ?? selectedDate ?? new Date()
      return startOfMonth(base)
    }, [defaultMonth, monthProp, selectedDate])

    const [uncontrolledMonth, setUncontrolledMonth] =
      React.useState<Date>(initialMonth)
    const isMonthControlled = monthProp !== undefined
    const currentMonth = startOfMonth(isMonthControlled ? monthProp : uncontrolledMonth)

    const [focusedDate, setFocusedDate] = React.useState<Date>(() => {
      return startOfDay(selectedDate ?? currentMonth)
    })

    const dayRefs = React.useRef<Map<string, View | null>>(new Map())

    const isDateDisabled = React.useCallback(
      (date: Date) => {
        if (disabled) return true
        const day = startOfDay(date)
        if (minDate && day < startOfDay(minDate)) return true
        if (maxDate && day > startOfDay(maxDate)) return true
        return disabledDates?.(day) ?? false
      },
      [disabled, disabledDates, maxDate, minDate],
    )

    const handleValueChange = React.useCallback(
      (date?: Date) => {
        if (!isValueControlled) {
          setUncontrolledValue(date)
        }
        onValueChange?.(date)
      },
      [isValueControlled, onValueChange],
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
      if (!isMonthControlled && selectedDate) {
        if (!isSameMonth(selectedDate, currentMonth)) {
          handleMonthChange(selectedDate)
        }
      }
    }, [currentMonth, handleMonthChange, isMonthControlled, selectedDate])

    React.useEffect(() => {
      if (selectedDate) {
        setFocusedDate(startOfDay(selectedDate))
      }
    }, [selectedDate])

    React.useEffect(() => {
      if (!isSameMonth(focusedDate, currentMonth)) {
        setFocusedDate(startOfDay(currentMonth))
      }
    }, [currentMonth, focusedDate])

    const monthLabel = React.useMemo(() => {
      const formatter = new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
      })
      return formatter.format(currentMonth)
    }, [currentMonth, locale])

    const weekdayLabels = React.useMemo(() => {
      const formatter = new Intl.DateTimeFormat(locale, {
        weekday: weekdayFormat,
      })
      const base = new Date(2021, 7, 1)
      return Array.from({ length: 7 }, (_, index) => {
        return formatter.format(addDays(base, (weekStartsOn + index) % 7))
      })
    }, [locale, weekStartsOn, weekdayFormat])

    const dayLabelFormatter = React.useMemo(() => {
      return new Intl.DateTimeFormat(locale, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }, [locale])

    const weeks = React.useMemo(
      () => getCalendarDays(currentMonth, weekStartsOn),
      [currentMonth, weekStartsOn],
    )

    const setDayRef = React.useCallback((key: string) => {
      return (node: View | null) => {
        if (node) {
          dayRefs.current.set(key, node)
        } else {
          dayRefs.current.delete(key)
        }
      }
    }, [])

    const focusDate = React.useCallback(
      (date: Date) => {
        const next = clampDate(date, minDate, maxDate)
        setFocusedDate(next)
        if (!isSameMonth(next, currentMonth)) {
          handleMonthChange(next)
        }
      },
      [currentMonth, handleMonthChange, maxDate, minDate],
    )

    React.useEffect(() => {
      if (Platform.OS !== "web") return
      const key = formatDateKey(focusedDate)
      const node = dayRefs.current.get(key)
      if (node && typeof (node as { focus?: () => void }).focus === "function") {
        requestAnimationFrame(() => {
          ;(node as { focus?: () => void }).focus?.()
        })
      }
    }, [focusedDate])

    const handleSelectDate = React.useCallback(
      (date: Date) => {
        if (isDateDisabled(date)) return
        handleValueChange(startOfDay(date))
        focusDate(date)
      },
      [focusDate, handleValueChange, isDateDisabled],
    )

    const handleDayKeyDown = React.useCallback(
      // biome-ignore lint/suspicious/noExplicitAny: Web-only keyboard event type
      (event: any, date: Date) => {
        if (Platform.OS !== "web") return
        if (disabled) return

        let nextDate: Date | null = null

        switch (event.key) {
          case "ArrowLeft":
            nextDate = addDays(date, -1)
            break
          case "ArrowRight":
            nextDate = addDays(date, 1)
            break
          case "ArrowUp":
            nextDate = addDays(date, -7)
            break
          case "ArrowDown":
            nextDate = addDays(date, 7)
            break
          case "Home":
            nextDate = getWeekStart(date, weekStartsOn)
            break
          case "End":
            nextDate = getWeekEnd(date, weekStartsOn)
            break
          case "PageUp":
            nextDate = event.shiftKey ? addYears(date, -1) : addMonths(date, -1)
            break
          case "PageDown":
            nextDate = event.shiftKey ? addYears(date, 1) : addMonths(date, 1)
            break
          case "Enter":
          case " ":
            event.preventDefault()
            handleSelectDate(date)
            return
          default:
            return
        }

        if (nextDate) {
          event.preventDefault()
          focusDate(nextDate)
        }
      },
      [disabled, focusDate, handleSelectDate, weekStartsOn],
    )

    const handlePrevMonth = React.useCallback(() => {
      focusDate(addMonths(currentMonth, -1))
    }, [currentMonth, focusDate])

    const handleNextMonth = React.useCallback(() => {
      focusDate(addMonths(currentMonth, 1))
    }, [currentMonth, focusDate])

    return (
      <View ref={ref} style={[styles.container, style]} {...props}>
        <View style={styles.header}>
          <CalendarNavButton
            accessibilityLabel="Previous month"
            onPress={handlePrevMonth}
            disabled={disabled}
          >
            <Text style={styles.navIcon}>{"<"}</Text>
          </CalendarNavButton>
          <Text style={styles.headerLabel}>{monthLabel}</Text>
          <CalendarNavButton
            accessibilityLabel="Next month"
            onPress={handleNextMonth}
            disabled={disabled}
          >
            <Text style={styles.navIcon}>{">"}</Text>
          </CalendarNavButton>
        </View>
        <View style={styles.weekdayRow}>
          {weekdayLabels.map((label) => (
            <Text key={label} style={styles.weekdayText}>
              {label}
            </Text>
          ))}
        </View>
        <View style={styles.weeks}>
          {weeks.map((week) => (
            <View key={`week-${formatDateKey(week[0].date)}`} style={styles.weekRow}>
              {week.map((day) => {
                const isOutside = day.outside
                const isSelected =
                  selectedDate !== undefined &&
                  isSameDay(day.date, selectedDate)
                const isToday = isSameDay(day.date, new Date())
                const isDayDisabled = isDateDisabled(day.date)
                const isFocused = isSameDay(day.date, focusedDate)
                const dayKey = formatDateKey(day.date)
                const dayLabel = dayLabelFormatter.format(day.date)

                return (
                  <CalendarDayButton
                    key={dayKey}
                    date={day.date}
                    label={day.date.getDate()}
                    ariaLabel={dayLabel}
                    outside={isOutside}
                    showOutsideDays={showOutsideDays}
                    selected={isSelected}
                    today={isToday}
                    disabled={isDayDisabled}
                    focused={isFocused}
                    setDayRef={setDayRef(dayKey)}
                    onSelect={handleSelectDate}
                    onFocusDate={focusDate}
                    onKeyDown={handleDayKeyDown}
                  />
                )
              })}
            </View>
          ))}
        </View>
      </View>
    )
  },
)

Calendar.displayName = "Calendar"

type CalendarDayButtonProps = Omit<PressableProps, "onPress"> & {
  date: Date
  label: number
  ariaLabel: string
  outside: boolean
  showOutsideDays: boolean
  selected: boolean
  today: boolean
  disabled: boolean
  focused: boolean
  setDayRef: (node: View | null) => void
  onSelect: (date: Date) => void
  onFocusDate: (date: Date) => void
  onKeyDown: (event: unknown, date: Date) => void
}

function CalendarDayButton({
  date,
  label,
  ariaLabel,
  outside,
  showOutsideDays,
  selected,
  today,
  disabled,
  focused,
  setDayRef,
  onSelect,
  onFocusDate,
  onKeyDown,
  style,
  ...props
}: CalendarDayButtonProps) {
  const variantStyles = styles.useVariants({
    selected,
    today,
    outside,
    disabled,
    focused,
  })

  const textStyle = [
    styles.dayText,
    selected && styles.dayTextSelected,
    today && styles.dayTextToday,
    outside && styles.dayTextOutside,
    disabled && styles.dayTextDisabled,
  ]

  const handlePress = React.useCallback(() => {
    if (disabled) return
    onSelect(date)
  }, [date, disabled, onSelect])

  const handleFocus = React.useCallback(() => {
    if (disabled) return
    onFocusDate(date)
  }, [date, disabled, onFocusDate])

  if (!showOutsideDays && outside) {
    return <View style={styles.dayPlaceholder} />
  }

  return (
    <Pressable
      ref={setDayRef}
      // @ts-expect-error - web-only role
      role={Platform.OS === "web" ? "gridcell" : undefined}
      aria-label={Platform.OS === "web" ? ariaLabel : undefined}
      aria-selected={Platform.OS === "web" ? selected : undefined}
      aria-disabled={Platform.OS === "web" ? disabled : undefined}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      focusable={!disabled}
      onPress={handlePress}
      onFocus={handleFocus}
      onKeyDown={Platform.OS === "web" ? (event: unknown) => onKeyDown(event, date) : undefined}
      tabIndex={Platform.OS === "web" ? (focused ? 0 : -1) : undefined}
      style={({ pressed }) =>
        [
          styles.dayButton,
          variantStyles,
          pressed && !disabled && styles.dayPressed,
          typeof style === "function" ? style({ pressed }) : style,
          // biome-ignore lint/suspicious/noExplicitAny: Complex style array with variants requires type assertion
        ] as any
      }
      {...props}
    >
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  )
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

type CalendarNavButtonProps = PressableProps & {
  children: React.ReactNode
}

function CalendarNavButton({
  children,
  disabled,
  style,
  ...props
}: CalendarNavButtonProps) {
  const variantStyles = styles.useVariants({
    disabled: !!disabled,
  })

  return (
    <Pressable
      role={Platform.OS === "web" ? "button" : undefined}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={({ pressed }) =>
        [
          styles.navButton,
          variantStyles,
          pressed && !disabled && styles.navButtonPressed,
          typeof style === "function" ? style({ pressed }) : style,
          // biome-ignore lint/suspicious/noExplicitAny: Complex style array with variants requires type assertion
        ] as any
      }
      {...props}
    >
      {children}
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.popover,
  },
  header: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[2],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLabel: {
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.foreground,
  },
  navButton: {
    width: theme.spacing[8],
    height: theme.spacing[8],
    borderRadius: theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    variants: {
      disabled: {
        true: {
          opacity: 0.5,
        },
      },
    },
  },
  navButtonPressed: {
    backgroundColor: theme.colors.muted,
  },
  navIcon: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.foreground,
  },
  weekdayRow: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing[2],
    paddingBottom: theme.spacing[1],
  },
  weekdayText: {
    flex: 1,
    textAlign: "center",
    fontSize: theme.typography.sizes.xs,
    lineHeight: theme.typography.lineHeights.xs,
    color: theme.colors.mutedForeground,
  },
  weeks: {
    gap: theme.spacing[1],
    paddingHorizontal: theme.spacing[2],
    paddingBottom: theme.spacing[2],
  },
  weekRow: {
    flexDirection: "row",
    gap: theme.spacing[1],
  },
  dayPlaceholder: {
    flex: 1,
    height: theme.spacing[8],
  },
  dayButton: {
    flex: 1,
    height: theme.spacing[8],
    borderRadius: theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    variants: {
      selected: {
        true: {
          backgroundColor: theme.colors.primary,
        },
      },
      today: {
        true: {
          borderWidth: 1,
          borderColor: theme.colors.ring,
        },
      },
      outside: {
        true: {
          opacity: 0.6,
        },
      },
      disabled: {
        true: {
          opacity: 0.4,
        },
      },
      focused: {
        true: {
          borderWidth: 2,
          borderColor: theme.colors.ring,
        },
      },
    },
  },
  dayPressed: {
    backgroundColor: theme.colors.muted,
  },
  dayText: {
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    color: theme.colors.foreground,
  },
  dayTextSelected: {
    color: theme.colors.primaryForeground,
  },
  dayTextOutside: {
    color: theme.colors.mutedForeground,
  },
  dayTextDisabled: {
    color: theme.colors.mutedForeground,
  },
  dayTextToday: {
    fontWeight: theme.typography.weights.semibold,
  },
}))
