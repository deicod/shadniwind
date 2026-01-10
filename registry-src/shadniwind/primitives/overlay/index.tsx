import * as React from "react"
import {
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  View,
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

type OverlayBackdropRef = React.ComponentRef<typeof Pressable>

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

/**
 * A full-screen backdrop component that can optionally be visible (scrim).
 */
export const OverlayBackdrop = React.forwardRef<
  OverlayBackdropRef,
  OverlayBackdropProps
>(
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
    const importance =
      importantForAccessibility ?? (accessible ? undefined : "no")

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

/**
 * A layer that facilitates dismissing content when users interact outside of it
 * or perform a system "back" action.
 * 
 * **Behaviors:**
 * - **Web:** Adds a global listener for the `Escape` key to trigger `onDismiss`.
 * - **Android:** Adds a `BackHandler` listener to trigger `onDismiss` when the 
 *   hardware back button is pressed.
 * - **Click-outside:** Triggers `onDismiss` when the backdrop/scrim is pressed.
 */
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
      // Web: Escape key
      if (Platform.OS === "web") {
        if (!isDismissable) return
        if (typeof document === "undefined") return

        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.defaultPrevented) return
          if (event.key !== "Escape" && event.key !== "Esc") return

          onDismiss?.()
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
      }

      // Native: Back button (Android)
      if (Platform.OS === "android") {
        if (!isDismissable) return

        const { BackHandler } = require("react-native")

        const handleBackPress = () => {
          onDismiss?.()
          return true // Prevent default behavior (exit app)
        }

        const subscription = BackHandler.addEventListener(
          "hardwareBackPress",
          handleBackPress,
        )
        return () => subscription.remove()
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

/**
 * A high-level Overlay component that combines a `DismissLayer` with a visible scrim by default.
 */
export const Overlay = React.forwardRef<View, OverlayProps>(
  ({ scrim = true, ...props }, ref) => {
    return <DismissLayer ref={ref} scrim={scrim} {...props} />
  },
)

Overlay.displayName = "Overlay"
