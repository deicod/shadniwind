import { Fragment, useSyncExternalStore } from "react"
import { StyleSheet, View, type ViewProps } from "react-native"

import { usePortalStore } from "./PortalProvider"

export type PortalHostProps = ViewProps & {
  /**
   * The unique name of this portal host.
   * Portals with a matching `name` prop will render their content here.
   * @default "root"
   */
  name?: string
}

const DEFAULT_HOST_NAME = "root"

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
  },
})

/**
 * A container that renders content teleported from `<Portal>` components.
 *
 * **Usage:**
 * It is typically placed at the root of the app (top-level) to ensure
 * overlays (like Modals, Toasts, or Tooltips) render above all other UI elements.
 * 
 * **Behavior:**
 * By default, it fills the entire screen using `StyleSheet.absoluteFillObject`.
 * It is configured with `pointerEvents="box-none"` by default, allowing touch
 * events to pass through to underlying views when no portal content is blocking them.
 *
 * @example
 * <PortalHost name="root" />
 */
export function PortalHost({
  name = DEFAULT_HOST_NAME,
  pointerEvents,
  style,
  children,
  ...props
}: PortalHostProps) {
  const store = usePortalStore()

  const nodes = useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot(name),
    () => store.getSnapshot(name),
  )

  return (
    <View
      pointerEvents={pointerEvents ?? "box-none"}
      style={[styles.host, style]}
      {...props}
    >
      {children}
      {nodes.map((entry) => (
        <Fragment key={entry.key}>{entry.node}</Fragment>
      ))}
    </View>
  )
}
