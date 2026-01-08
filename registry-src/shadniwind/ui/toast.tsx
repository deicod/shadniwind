// @ts-expect-error - lucide-react-native is a peer dependency
import { X } from "lucide-react-native"
import * as React from "react"
import {
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  Text,
  type TextProps,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"
import { Portal } from "../primitives/portal/index.js"

// ----------------------------------------------------------------------------
// Types & Interfaces
// ----------------------------------------------------------------------------

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToastActionElement = React.ReactElement

export type ToastProps = ViewProps & {
  variant?: "default" | "destructive"
  duration?: number
  id?: string
}

// ----------------------------------------------------------------------------
// State Management (Simplified version of use-toast.ts)
// ----------------------------------------------------------------------------

type Toast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
} & ToastProps

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType =
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "UPDATE_TOAST"; toast: Partial<Toast> }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string }

interface State {
  toasts: Toast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: ActionType): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
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

      // ! Side effects ! - This could be extracted into a subscribe/listener ideally
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        for (const toast of state.toasts) {
          addToRemoveQueue(toast.id)
        }
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
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
  for (const listener of listeners) {
    listener(memoryState)
  }
}

type ToastInput = Omit<Toast, "id">

function toast({ ...props }: ToastInput) {
  const id = genId()

  const update = (props: ToastInput) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  if (props.duration !== undefined) {
    setTimeout(() => {
      dismiss()
    }, props.duration)
  }

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }

// ----------------------------------------------------------------------------
// Components
// ----------------------------------------------------------------------------

const ToastContext = React.createContext<{
  id: string
  dismiss: () => void
} | null>(null)

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export const ToastViewport = React.forwardRef<
  View,
  ViewProps & {
    portal?: boolean
  }
>(({ style, children, portal = true, ...props }, ref) => {
  const content = (
    <View
      ref={ref}
      style={[styles.viewport, style]}
      pointerEvents="box-none"
      {...props}
    >
      {children}
    </View>
  )

  if (portal) {
    return <Portal>{content}</Portal>
  }

  return content
})

ToastViewport.displayName = "ToastViewport"

export const Toast = React.forwardRef<View, ToastProps>(
  ({ variant = "default", style, children, id, ...props }, ref) => {
    styles.useVariants({
      variant: variant === "default" ? undefined : variant,
    })

    return (
      <View ref={ref} style={[styles.toast, style]} {...props}>
        {children}
      </View>
    )
  },
)

Toast.displayName = "Toast"

export const ToastAction = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  PressableProps
>(({ style, ...props }, ref) => {
  return (
    <Pressable
      ref={ref}
      style={({ pressed }) =>
        [
          styles.action,
          pressed && styles.actionPressed,
          style,
        ] as StyleProp<ViewStyle>
      }
      {...props}
    />
  )
})

ToastAction.displayName = "ToastAction"

export const ToastClose = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  PressableProps
>(({ style, ...props }, ref) => {
  const { dismiss } = useToast()

  // Need to know WHICH ID to dismiss.
  // In pure Shadcn, ToastClose calls toast-primitive's close.
  // Here we need context to know ID.
  const context = React.useContext(ToastContext)

  return (
    <Pressable
      ref={ref}
      style={({ pressed }) =>
        [
          styles.close,
          pressed && styles.closePressed,
          style,
        ] as StyleProp<ViewStyle>
      }
      onPress={(e) => {
        if (context) {
          dismiss(context.id)
        }
        props.onPress?.(e)
      }}
      {...props}
    >
      <X size={18} color={styles.closeIcon.color} />
    </Pressable>
  )
})

ToastClose.displayName = "ToastClose"

export const ToastTitle = React.forwardRef<Text, TextProps>(
  ({ style, ...props }, ref) => {
    return <Text ref={ref} style={[styles.title, style]} {...props} />
  },
)

ToastTitle.displayName = "ToastTitle"

export const ToastDescription = React.forwardRef<Text, TextProps>(
  ({ style, ...props }, ref) => {
    return <Text ref={ref} style={[styles.description, style]} {...props} />
  },
)

ToastDescription.displayName = "ToastDescription"

// ----------------------------------------------------------------------------
// Toaster Component
// ----------------------------------------------------------------------------

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <ToastProvider>
      <ToastViewport>
        {toasts.map(({ id, title, description, action, open, ...props }) => {
          if (!open) return null
          return (
            <ToastContext.Provider
              key={id}
              value={{ id, dismiss: () => dismiss(id) }}
            >
              <Toast key={id} id={id} {...props}>
                <View style={styles.contentContainer}>
                  {title && <ToastTitle>{title}</ToastTitle>}
                  {description && (
                    <ToastDescription>{description}</ToastDescription>
                  )}
                </View>
                {action}
                <ToastClose />
              </Toast>
            </ToastContext.Provider>
          )
        })}
      </ToastViewport>
    </ToastProvider>
  )
}

// ----------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------

const styles = StyleSheet.create((theme) => ({
  viewport: {
    position: "absolute",
    zIndex: 100,
    flexDirection: "column-reverse", // Newest at bottom if bottom positioned? Or top?
    // Shadcn default is top-right or bottom-right usually.
    top: Platform.OS === "web" ? 0 : 44, // Safe area rough guess or 0
    left: 0,
    right: 0,
    padding: 16,
    gap: 10,
    maxHeight: "100%",
    pointerEvents: "box-none",
  },
  toast: {
    pointerEvents: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.foreground,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    variants: {
      variant: {
        default: {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
        },
        destructive: {
          backgroundColor: theme.colors.destructive, // Usually red
          borderColor: theme.colors.destructive,
        },
      },
    },
  },
  contentContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.foreground,
  },
  description: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.mutedForeground,
  },
  action: {
    marginLeft: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primary,
  },
  actionPressed: {
    opacity: 0.8,
  },
  close: {
    opacity: 0.7,
    padding: 4,
  },
  closePressed: {
    opacity: 1,
  },
  closeIcon: {
    color: theme.colors.foreground,
  },
}))
