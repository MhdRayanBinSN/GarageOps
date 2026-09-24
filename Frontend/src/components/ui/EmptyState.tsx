import React from 'react'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-slate-200 bg-slate-50/70 ${className}`}
    >
      {icon && (
        <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-4 shadow-xs">
          {icon}
        </div>
      )}
      <h4 className="font-display text-lg font-bold text-slate-800 tracking-tight uppercase">
        {title}
      </h4>
      {description && (
        <p className="mt-1.5 text-sm text-slate-500 max-w-sm">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
