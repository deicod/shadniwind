import { Fragment, useSyncExternalStore } from "react"
import { StyleSheet, View, type ViewProps } from "react-native"

import { usePortalStore } from "./PortalProvider.js"

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
 * A container that renders content teleported from <Portal> components.
 *
 * It is typically placed at the root of the app (top-level) to ensure
 * content (like Modals, Toasts) renders above other UI.
 *
 * By default, it fills the entire screen using absolute positioning and
 * allows touch events to pass through (`pointerEvents="box-none"`).
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
