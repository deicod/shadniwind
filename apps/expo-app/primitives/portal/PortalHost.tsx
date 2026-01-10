import { Fragment, useSyncExternalStore } from "react"
import { StyleSheet, View, type ViewProps } from "react-native"

import { usePortalStore } from "./PortalProvider"

export type PortalHostProps = ViewProps & {
  name?: string
}

const DEFAULT_HOST_NAME = "root"

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
  },
})

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
