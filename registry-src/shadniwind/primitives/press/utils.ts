/**
 * Composes multiple event handlers into a single handler.
 * Executed in order. If a handler prevents default, subsequent handlers may still run
 * depending on logic, but here we simply run them all.
 */
export function composeEventHandlers<E>(
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
