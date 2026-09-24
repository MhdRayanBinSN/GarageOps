import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark' | 'glass'
  glow?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'light',
  glow = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    light: 'bg-white border border-slate-200 text-slate-900 shadow-sm hover:shadow-md transition-shadow',
    dark: 'bg-white border border-slate-200 text-slate-900 shadow-sm',
    glass: 'bg-white/80 backdrop-blur-md border border-slate-200/80 text-slate-900 shadow-sm',
  }

  const glowStyle = glow ? 'ring-1 ring-brand-red/30 shadow-brand-red/10' : ''

  return (
    <div
      className={`rounded-lg p-4 transition-all duration-200 relative overflow-hidden ${variantStyles[variant]} ${glowStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
