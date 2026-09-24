import React, { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string | number
  label: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  error?: string
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            {label}
            {props.required && <span className="text-brand-red ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`w-full appearance-none bg-white border text-slate-900 text-sm rounded-md pl-3 pr-9 py-2 transition-colors duration-150 focus:outline-none focus:ring-2 cursor-pointer ${
              error
                ? 'border-brand-red focus:border-brand-red focus:ring-brand-red/20'
                : 'border-slate-300 focus:border-brand-red focus:ring-brand-red/20 hover:border-slate-400'
            } ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-white text-slate-400">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white text-slate-800">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="text-xs text-brand-red font-medium">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
