export type PointerEvents = "auto" | "none" | "box-none" | "box-only"

export type ResolveDismissLayerStateOptions = {
  dismissable?: boolean
  onDismiss?: (() => void) | undefined
  scrim?: boolean
  scrimPointerEvents?: PointerEvents
}

export type DismissLayerState = {
  isDismissable: boolean
  shouldCapture: boolean
  backdropPointerEvents: PointerEvents
}

export function resolveDismissLayerState({
  dismissable,
  onDismiss,
  scrim,
  scrimPointerEvents,
}: ResolveDismissLayerStateOptions): DismissLayerState {
  const isDismissable = dismissable ?? Boolean(onDismiss)
  const shouldCapture = Boolean(scrim) || isDismissable
  const backdropPointerEvents = scrimPointerEvents ?? (shouldCapture ? "auto" : "none")

  return {
    isDismissable,
    shouldCapture,
    backdropPointerEvents,
  }
}
