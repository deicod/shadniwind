import type React from "react"
import { forwardRef, useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
export type ButtonSize = "default" | "sm" | "lg" | "icon"

export type ButtonProps = Omit<PressableProps, "style"> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

const DEFAULT_VARIANT: ButtonVariant = "default"
const DEFAULT_SIZE: ButtonSize = "default"

const styles = StyleSheet.create((theme) => {
  const focusRingStyle =
    Platform.OS === "web"
      ? ({
          outlineStyle: "solid",
          outlineWidth: 2,
          outlineColor: theme.colors.ring,
          outlineOffset: 2,
        } as const)
      : {}

  return {
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: "transparent",
      backgroundColor: theme.colors.primary,
      variants: {
        variant: {
          default: {
            backgroundColor: theme.colors.primary,
          },
          destructive: {
            backgroundColor: theme.colors.destructive,
          },
          outline: {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.input,
          },
          secondary: {
            backgroundColor: theme.colors.secondary,
          },
          ghost: {
            backgroundColor: "transparent",
          },
          link: {
            backgroundColor: "transparent",
            borderColor: "transparent",
          },
        },
        size: {
          default: {
            height: 40,
            paddingHorizontal: 16,
          },
          sm: {
            height: 36,
            paddingHorizontal: 12,
          },
          lg: {
            height: 44,
            paddingHorizontal: 24,
          },
          icon: {
            height: 40,
            width: 40,
            paddingHorizontal: 0,
          },
        },
        pressed: {
          true: {
            opacity: 0.9,
          },
        },
        disabled: {
          true: {
            opacity: 0.6,
          },
        },
        loading: {
          true: {
            opacity: 0.7,
          },
        },
        focusVisible: {
          true: focusRingStyle,
        },
      },
      compoundVariants: [
        {
          variant: "link",
          styles: {
            paddingHorizontal: 0,
          },
        },
        {
          variant: "outline",
          pressed: true,
          styles: {
            backgroundColor: theme.colors.accent,
            opacity: 1,
          },
        },
        {
          variant: "ghost",
          pressed: true,
          styles: {
            backgroundColor: theme.colors.accent,
            opacity: 1,
          },
        },
        {
          variant: "link",
          pressed: true,
          styles: {
            opacity: 0.7,
          },
        },
      ],
    },
    label: {
      fontSize: theme.typography.sizes.sm,
      lineHeight: theme.typography.lineHeights.sm,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.primaryForeground,
      variants: {
        variant: {
          default: {
            color: theme.colors.primaryForeground,
          },
          destructive: {
            color: theme.colors.destructiveForeground,
          },
          outline: {
            color: theme.colors.foreground,
          },
          secondary: {
            color: theme.colors.secondaryForeground,
          },
          ghost: {
            color: theme.colors.foreground,
          },
          link: {
            color: theme.colors.primary,
            textDecorationLine: "underline",
          },
        },
        size: {
          default: {
            fontSize: theme.typography.sizes.sm,
            lineHeight: theme.typography.lineHeights.sm,
          },
          sm: {
            fontSize: theme.typography.sizes.xs,
            lineHeight: theme.typography.lineHeights.xs,
          },
          lg: {
            fontSize: theme.typography.sizes.md,
            lineHeight: theme.typography.lineHeights.md,
          },
          icon: {
            fontSize: theme.typography.sizes.sm,
            lineHeight: theme.typography.lineHeights.sm,
          },
        },
      },
    },
    spinner: {
      marginRight: 8,
    },
  }
})

type ButtonRef = React.ElementRef<typeof Pressable>

export const Button = forwardRef<ButtonRef, ButtonProps>(
  (
    {
      variant = DEFAULT_VARIANT,
      size = DEFAULT_SIZE,
      loading = false,
      disabled,
      style,
      textStyle,
      children,
      onFocus,
      onBlur,
      onPressIn,
      onPressOut,
      accessibilityRole,
      ...props
    },
    ref,
  ) => {
    const { theme } = useUnistyles()
    const [focusVisible, setFocusVisible] = useState(false)
    const [pressed, setPressed] = useState(false)
    const isDisabled = disabled || loading
    const hasText = typeof children === "string" || typeof children === "number"

    const baseVariants = {
      variant: variant === "default" ? undefined : variant,
      size: size === "default" ? undefined : size,
      disabled: isDisabled,
      loading,
      focusVisible,
    }

    styles.useVariants({
      ...baseVariants,
      pressed: pressed && !isDisabled ? true : undefined,
    })

    useEffect(() => {
      if (isDisabled) {
        setPressed(false)
      }
    }, [isDisabled])

    const spinnerColor = useMemo(() => {
      switch (variant) {
        case "destructive":
          return theme.colors.destructiveForeground
        case "outline":
        case "ghost":
          return theme.colors.foreground
        case "secondary":
          return theme.colors.secondaryForeground
        case "link":
          return theme.colors.primary
        default:
          return theme.colors.primaryForeground
      }
    }, [theme, variant])

    const handleFocus: PressableProps["onFocus"] = (event) => {
      if (Platform.OS === "web") {
        setFocusVisible(true)
      }
      onFocus?.(event)
    }

    const handleBlur: PressableProps["onBlur"] = (event) => {
      if (Platform.OS === "web") {
        setFocusVisible(false)
      }
      onBlur?.(event)
    }

    const handlePressIn: PressableProps["onPressIn"] = (event) => {
      if (!isDisabled) {
        setPressed(true)
      }
      onPressIn?.(event)
    }

    const handlePressOut: PressableProps["onPressOut"] = (event) => {
      setPressed(false)
      onPressOut?.(event)
    }

    return (
      <Pressable
        ref={ref}
        accessibilityRole={accessibilityRole ?? "button"}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container as ViewStyle, style]}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            color={spinnerColor}
            size="small"
            style={hasText ? (styles.spinner as ViewStyle) : undefined}
          />
        ) : null}
        {hasText ? <Text style={[styles.label as TextStyle, textStyle]}>{children}</Text> : (children as React.ReactNode)}
      </Pressable>
    )
  },
)

Button.displayName = "Button"
