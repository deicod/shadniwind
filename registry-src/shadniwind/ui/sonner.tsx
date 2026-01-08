// @ts-expect-error - lucide-react-native is a peer dependency
import { AlertCircle, AlertTriangle, Check, Info } from "lucide-react-native"
import * as React from "react"
import { Animated, Platform, Pressable, Text, View } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"
import { Portal } from "../primitives/portal/index.js"

const TOAST_LIMIT = 3
const _TOAST_REMOVE_DELAY = 1000000
const GAP = 14
const _SWIPE_THRESHOLD = 50

type ToastType =
  | "normal"
  | "action"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "loading"

export type ToastProps = {
  id: string
  title?: string
  description?: string
  type?: ToastType
  action?: {
    label: string
    onClick: () => void
  }
  cancel?: {
    label: string
    onClick: () => void
  }
  onDismiss?: () => void
  onAutoClose?: () => void
  duration?: number
  important?: boolean
  closeButton?: boolean
  dismissible?: boolean
}

type ToastState = ToastProps & {
  open: boolean
}

// ----------------------------------------------------------------------------
// State
// ----------------------------------------------------------------------------

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType =
  | { type: "ADD_TOAST"; toast: ToastProps }
  | { type: "UPDATE_TOAST"; toast: Partial<ToastProps> }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string }

interface State {
  toasts: ToastState[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) return

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({ type: "REMOVE_TOAST", toastId: toastId })
  }, 1000) // Short delay to allow animation to finish

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: ActionType): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [{ ...action.toast, open: true }, ...state.toasts].slice(
          0,
          TOAST_LIMIT + 1,
        ),
      }
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t,
        ),
      }
    case "DISMISS_TOAST": {
      const { toastId } = action
      if (toastId) addToRemoveQueue(toastId)
      else
        state.toasts.forEach((t) => {
          addToRemoveQueue(t.id)
        })

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined ? { ...t, open: false } : t,
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) return { ...state, toasts: [] }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

function dispatch(action: ActionType) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

function toast(
  message: string | Omit<ToastProps, "id">,
  data?: Omit<ToastProps, "id" | "title">,
) {
  const id = genId()
  const props: Omit<ToastProps, "id"> =
    typeof message === "string" ? { title: message, ...data } : message

  dispatch({
    type: "ADD_TOAST",
    toast: { ...props, id },
  })

  return id
}

toast.message = (message: string, data?: Omit<ToastProps, "id" | "title">) =>
  toast(message, { ...data, type: "normal" })
toast.error = (message: string, data?: Omit<ToastProps, "id" | "title">) =>
  toast(message, { ...data, type: "error" })
toast.success = (message: string, data?: Omit<ToastProps, "id" | "title">) =>
  toast(message, { ...data, type: "success" })
toast.info = (message: string, data?: Omit<ToastProps, "id" | "title">) =>
  toast(message, { ...data, type: "info" })
toast.warning = (message: string, data?: Omit<ToastProps, "id" | "title">) =>
  toast(message, { ...data, type: "warning" })
// biome-ignore lint/suspicious/noExplicitAny: Not implemented yet
toast.custom = (_jsx: any) => {
  /* Not implemented yet for custom JSX */
}
toast.dismiss = (toastId?: string) =>
  dispatch({ type: "DISMISS_TOAST", toastId })

function useSonner() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  return state
}

const ToastIcon = ({ type }: { type?: ToastType }) => {
  const { theme } = useUnistyles()
  switch (type) {
    case "success":
      return <Check size={18} color={theme.colors.primary} />
    case "error":
      return <AlertCircle size={18} color={theme.colors.destructive} />
    case "info":
      return <Info size={18} color={theme.colors.primary} />
    case "warning":
      return <AlertTriangle size={18} color={theme.colors.destructive} />
    case "loading":
      return <Text>...</Text>
    default:
      return null
  }
}

const styles = StyleSheet.create((theme) => ({
  viewport: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    zIndex: 9999,
    alignItems: "center",
    pointerEvents: "box-none",
    paddingBottom: Platform.OS === "ios" ? 44 : 20,
  },
  toast: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    maxWidth: 400,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: theme.colors.foreground,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.foreground,
  },
  description: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.mutedForeground,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.md,
  },
  actionText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.background,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.foreground,
  },
}))

const ToastCard = ({
  item,
  index,
  onDismiss,
}: {
  item: ToastState
  index: number
  isFront: boolean
  onDismiss: (id: string) => void
  count: number
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current // Opacity
  const translateY = React.useRef(new Animated.Value(20)).current // Initial slide up
  const scale = React.useRef(new Animated.Value(1)).current

  const isVisible = index < TOAST_LIMIT && item.open

  React.useEffect(() => {
    if (item.open) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: index * -GAP,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1 - index * 0.05,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start()
    }
  }, [index, item.open, fadeAnim, translateY, scale])

  // Handle auto-close
  React.useEffect(() => {
    if (item.open && item.duration !== Number.POSITIVE_INFINITY) {
      const duration = item.duration ?? 4000
      const timer = setTimeout(() => {
        item.onAutoClose?.()
        onDismiss(item.id)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [item.id, item.open, item.duration, onDismiss, item.onAutoClose])

  // Handle onDismiss callback when toast closes
  const prevOpen = React.useRef(item.open)
  React.useEffect(() => {
    if (prevOpen.current && !item.open) {
      item.onDismiss?.()
    }
    prevOpen.current = item.open
  }, [item.open, item.onDismiss])

  if (!isVisible) return null

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity: fadeAnim,
          transform: [{ translateY }, { scale }],
          zIndex: TOAST_LIMIT - index,
        },
      ]}
    >
      <ToastIcon type={item.type} />
      <View style={styles.content}>
        {item.title && <Text style={styles.title}>{item.title}</Text>}
        {item.description && (
          <Text style={styles.description}>{item.description}</Text>
        )}
      </View>
      {item.action && (
        <Pressable onPress={item.action.onClick} style={styles.actionButton}>
          <Text style={styles.actionText}>{item.action.label}</Text>
        </Pressable>
      )}
      {item.cancel && (
        <Pressable onPress={item.cancel.onClick} style={styles.cancelButton}>
          <Text style={styles.cancelText}>{item.cancel.label}</Text>
        </Pressable>
      )}
    </Animated.View>
  )
}

export function Toaster() {
  const { toasts } = useSonner()

  const handleDismiss = React.useCallback((id: string) => {
    dispatch({ type: "DISMISS_TOAST", toastId: id })
  }, [])

  return (
    <Portal>
      <View style={styles.viewport} pointerEvents="box-none">
        {toasts.map((toast, index) => (
          <ToastCard
            key={toast.id}
            item={toast}
            index={index}
            isFront={index === 0}
            count={toasts.length}
            onDismiss={handleDismiss}
          />
        ))}
      </View>
    </Portal>
  )
}

export { toast }
