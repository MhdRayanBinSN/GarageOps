import React from 'react'
import { useToastStore, ToastType } from '@/store/toastStore'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-brand-red shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
  info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
}

const borderColors: Record<ToastType, string> = {
  success: 'border-emerald-200 bg-white text-emerald-900',
  error: 'border-rose-200 bg-white text-rose-900',
  warning: 'border-amber-200 bg-white text-amber-900',
  info: 'border-blue-200 bg-white text-blue-900',
}

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3 rounded-lg border shadow-lg transition-all duration-300 animate-slide-in-right ${borderColors[toast.type]}`}
        >
          {icons[toast.type]}
          <p className="text-sm font-medium leading-snug flex-1 break-words">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
