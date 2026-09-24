import React from 'react'
import { Spinner } from './Spinner'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'sand'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium transition-all duration-150 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]'

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
  }

  const variantStyles = {
    primary:
      'bg-brand-red hover:bg-brand-red/90 text-white shadow-md shadow-brand-red/20 focus:ring-brand-red/80',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 focus:ring-slate-400',
    outline:
      'border border-slate-300 hover:border-slate-400 bg-white text-slate-700 hover:text-slate-900 focus:ring-slate-400',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-300',
    danger:
      'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 focus:ring-red-500',
    sand:
      'bg-sand text-ink hover:bg-sand/90 font-semibold shadow-xs focus:ring-sand/80',
  }

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Spinner size="sm" className="border-current" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  )
}
