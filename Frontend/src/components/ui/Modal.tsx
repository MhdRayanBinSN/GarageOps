import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={onClose}
        />

        {/* Modal Dialog */}
        <div
          className={`inline-block w-full ${sizeClasses[size]} my-8 p-6 text-left align-middle transition-all transform bg-white border border-slate-200 rounded-lg shadow-xl relative z-10 animate-scale-up`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-display text-xl font-bold tracking-tight text-slate-900 uppercase">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="py-4 text-slate-700">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">{footer}</div>
          )}
        </div>
      </div>
    </div>
  )
}
