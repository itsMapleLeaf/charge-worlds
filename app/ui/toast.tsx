import { useAutoAnimate } from "@formkit/auto-animate/react"
import { Portal } from "ariakit"
import { AlertTriangle, CheckCircle2, Info, XOctagon } from "lucide-react"
import type { ContextType } from "react"
import { createContext, useContext, useMemo, useState } from "react"

type Toast = {
  id: string
  type: "info" | "warning" | "success" | "error"
  message: string
}

const ToastContext = createContext<Toast[]>([])

const ToastActionsContext = createContext({
  add: (type: Toast["type"], message: string) => {},
  dismiss: (id: string) => {},
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [animationParent] = useAutoAnimate()

  const actions = useMemo<ContextType<typeof ToastActionsContext>>(
    () => ({
      add: (type, message) => {
        const id = crypto.randomUUID()
        setToasts((toasts) => [...toasts, { id, type, message }])
        setTimeout(() => {
          actions.dismiss(id)
        }, 5000)
      },
      dismiss: (id) => {
        setToasts((toasts) => toasts.filter((toast) => toast.id !== id))
      },
    }),
    [],
  )

  return (
    <>
      <ToastContext.Provider value={toasts}>
        <ToastActionsContext.Provider value={actions}>
          {children}
        </ToastActionsContext.Provider>
      </ToastContext.Provider>
      <Portal>
        <ul
          className="pointer-events-none fixed inset-x-0 top-0 flex flex-col items-center gap-4 p-4"
          ref={animationParent}
        >
          {toasts.map((toast) => (
            <li role="alert" key={toast.id} className="w-full max-w-lg">
              <button
                className="pointer-events-auto flex w-full flex-row items-center gap-3 rounded-lg bg-white p-4 text-slate-900 shadow-lg"
                onClick={() => actions.dismiss(toast.id)}
              >
                {toast.type === "info" && <Info className="text-blue-600" />}
                {toast.type === "warning" && (
                  <AlertTriangle className="text-orange-600" />
                )}
                {toast.type === "success" && (
                  <CheckCircle2 className="text-green-600" />
                )}
                {toast.type === "error" && (
                  <XOctagon className="text-red-600" />
                )}
                {toast.message}
              </button>
            </li>
          ))}
        </ul>
      </Portal>
    </>
  )
}

export function useToastActions() {
  return useContext(ToastActionsContext)
}
