import * as React from "react"
import {
  Image,
  Text,
  View,
  type ImageProps,
  type ImageStyle,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"

type AvatarStatus = "idle" | "loading" | "loaded" | "error"

export type AvatarSize = "sm" | "md" | "lg"

export type AvatarProps = Omit<ViewProps, "style"> & {
  size?: AvatarSize
  style?: StyleProp<ViewStyle>
}

export type AvatarImageProps = Omit<ImageProps, "style"> & {
  style?: StyleProp<ImageStyle>
}

export type AvatarFallbackProps = Omit<ViewProps, "style"> & {
  delayMs?: number
  name?: string
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

type AvatarContextValue = {
  status: AvatarStatus
  setStatus: React.Dispatch<React.SetStateAction<AvatarStatus>>
  size: AvatarSize
}

const DEFAULT_SIZE: AvatarSize = "md"

const AvatarContext = React.createContext<AvatarContextValue | null>(null)

const avatarStyles = StyleSheet.create((theme) => ({
  root: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    overflow: "hidden",
    backgroundColor: theme.colors.muted,
    variants: {
      size: {
        sm: {
          width: 32,
          height: 32,
        },
        md: {
          width: 40,
          height: 40,
        },
        lg: {
          width: 56,
          height: 56,
        },
      },
    },
  },
  image: {
    width: "100%",
    height: "100%",
    variants: {
      imageVisible: {
        true: { opacity: 1 },
        false: { opacity: 0 },
      },
    },
  },
  fallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.muted,
  },
  fallbackText: {
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.mutedForeground,
    variants: {
      size: {
        sm: {
          fontSize: theme.typography.sizes.xs,
          lineHeight: theme.typography.lineHeights.xs,
        },
        md: {
          fontSize: theme.typography.sizes.sm,
          lineHeight: theme.typography.lineHeights.sm,
        },
        lg: {
          fontSize: theme.typography.sizes.md,
          lineHeight: theme.typography.lineHeights.md,
        },
      },
    },
  },
}))

const getInitials = (name: string) => {
  const trimmed = name.trim()
  if (!trimmed) {
    return ""
  }
  const parts = trimmed.split(/\s+/)
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export const Avatar = React.forwardRef<View, AvatarProps>(
  ({ size = DEFAULT_SIZE, style, children, ...props }, ref) => {
    const [status, setStatus] = React.useState<AvatarStatus>("idle")
    const variantStyles = avatarStyles.useVariants({ size }) as
      | typeof avatarStyles
      | undefined
    const styles = variantStyles ?? avatarStyles

    return (
      <AvatarContext.Provider value={{ status, setStatus, size }}>
        <View ref={ref} style={[styles.root, style]} {...props}>
          {children}
        </View>
      </AvatarContext.Provider>
    )
  },
)

Avatar.displayName = "Avatar"

type AvatarImageRef = React.ElementRef<typeof Image>

export const AvatarImage = React.forwardRef<AvatarImageRef, AvatarImageProps>(
  (
    {
      style,
      source,
      resizeMode = "cover",
      onLoadStart,
      onLoad,
      onError,
      ...props
    },
    ref,
  ) => {
    const context = React.useContext(AvatarContext)
    const size = context?.size ?? DEFAULT_SIZE
    const status = context?.status ?? "loaded"
    const setStatus = context?.setStatus

    const variantStyles = avatarStyles.useVariants({
      size,
      imageVisible: status === "loaded",
    }) as typeof avatarStyles | undefined
    const styles = variantStyles ?? avatarStyles

    React.useEffect(() => {
      if (!setStatus) {
        return
      }
      if (!source) {
        setStatus("idle")
        return
      }
      setStatus("loading")
    }, [setStatus, source])

    const handleLoadStart: NonNullable<ImageProps["onLoadStart"]> = () => {
      setStatus?.("loading")
      onLoadStart?.()
    }

    const handleLoad: NonNullable<ImageProps["onLoad"]> = (event) => {
      setStatus?.("loaded")
      onLoad?.(event)
    }

    const handleError: NonNullable<ImageProps["onError"]> = (event) => {
      setStatus?.("error")
      onError?.(event)
    }

    return (
      <Image
        ref={ref}
        source={source}
        resizeMode={resizeMode}
        style={[styles.image, style]}
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    )
  },
)

AvatarImage.displayName = "AvatarImage"

type AvatarFallbackRef = React.ElementRef<typeof View>

export const AvatarFallback = React.forwardRef<AvatarFallbackRef, AvatarFallbackProps>(
  ({ delayMs = 0, name, style, textStyle, children, ...props }, ref) => {
    const context = React.useContext(AvatarContext)
    const size = context?.size ?? DEFAULT_SIZE
    const status = context?.status ?? "idle"
    const [visible, setVisible] = React.useState(delayMs === 0)

    const variantStyles = avatarStyles.useVariants({ size }) as
      | typeof avatarStyles
      | undefined
    const styles = variantStyles ?? avatarStyles

    React.useEffect(() => {
      if (delayMs === 0) {
        setVisible(true)
        return
      }
      const timer = setTimeout(() => setVisible(true), delayMs)
      return () => clearTimeout(timer)
    }, [delayMs])

    if (status === "loaded" || !visible) {
      return null
    }

    const content = children ?? (name ? getInitials(name) : null)
    const isTextContent = typeof content === "string" || typeof content === "number"

    return (
      <View ref={ref} style={[styles.fallback, style]} {...props}>
        {isTextContent ? (
          <Text style={[styles.fallbackText, textStyle]}>{content}</Text>
        ) : (
          content
        )}
      </View>
    )
  },
)

AvatarFallback.displayName = "AvatarFallback"
