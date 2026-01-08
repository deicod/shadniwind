import * as React from "react"
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native"

import { resolveDismissLayerState } from "./dismiss-layer-state.js"

export type OverlayBackdropProps = Omit<PressableProps, "style"> & {
  style?: StyleProp<ViewStyle>
  visible?: boolean
}

export type DismissLayerProps = ViewProps & {
  children?: React.ReactNode
  onDismiss?: () => void
  dismissable?: boolean
  scrim?: boolean
  scrimStyle?: StyleProp<ViewStyle>
  scrimProps?: Omit<OverlayBackdropProps, "onPress" | "style" | "visible">
}

export type OverlayProps = DismissLayerProps

type OverlayBackdropRef = React.ElementRef<typeof Pressable>

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdropHidden: {
    backgroundColor: "transparent",
  },
})

export const OverlayBackdrop = React.forwardRef<OverlayBackdropRef, OverlayBackdropProps>(
  (
    {
      visible = true,
      style,
      accessible = false,
      accessibilityElementsHidden,
      importantForAccessibility,
      ...props
    },
    ref,
  ) => {
    const elementsHidden = accessibilityElementsHidden ?? !accessible
    const importance = importantForAccessibility ?? (accessible ? undefined : "no")

    return (
      <Pressable
        ref={ref}
        accessible={accessible}
        accessibilityElementsHidden={elementsHidden}
        importantForAccessibility={importance}
        style={[styles.backdrop, !visible && styles.backdropHidden, style]}
        {...props}
      />
    )
  },
)

OverlayBackdrop.displayName = "OverlayBackdrop"

export const DismissLayer = React.forwardRef<View, DismissLayerProps>(
  (
    {
      children,
      onDismiss,
      dismissable,
      scrim = false,
      scrimStyle,
      scrimProps,
      style,
      pointerEvents,
      ...props
    },
    ref,
  ) => {
    const { pointerEvents: scrimPointerEvents, ...scrimRest } = scrimProps ?? {}
    const { isDismissable, backdropPointerEvents } = resolveDismissLayerState({
      dismissable,
      onDismiss,
      scrim,
      scrimPointerEvents,
    })

    const handlePress = React.useCallback(() => {
      if (!isDismissable) {
        return
      }

      onDismiss?.()
    }, [isDismissable, onDismiss])

    React.useEffect(() => {
      if (Platform.OS !== "web" || !isDismissable) {
        return
      }

      if (typeof document === "undefined") {
        return
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.defaultPrevented) {
          return
        }

        if (event.key !== "Escape" && event.key !== "Esc") {
          return
        }

        onDismiss?.()
      }

      document.addEventListener("keydown", handleKeyDown)

      return () => {
        document.removeEventListener("keydown", handleKeyDown)
      }
    }, [isDismissable, onDismiss])

    return (
      <View
        ref={ref}
        pointerEvents={pointerEvents ?? "box-none"}
        style={[styles.container, style]}
        {...props}
      >
        <OverlayBackdrop
          visible={scrim}
          onPress={isDismissable ? handlePress : undefined}
          pointerEvents={backdropPointerEvents}
          style={scrimStyle}
          {...scrimRest}
        />
        {children}
      </View>
    )
  },
)

DismissLayer.displayName = "DismissLayer"

export const Overlay = React.forwardRef<View, OverlayProps>(({ scrim = true, ...props }, ref) => {
  return <DismissLayer ref={ref} scrim={scrim} {...props} />
})

Overlay.displayName = "Overlay"
