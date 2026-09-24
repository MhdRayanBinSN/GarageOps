import React from 'react'
import { useAuthStore } from '@/store/authStore'
import { User, Shield, Building2 } from 'lucide-react'

export const Topbar: React.FC = () => {
  const { userType, employeeRole, workshopId } = useAuthStore()

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-8 flex items-center justify-between shadow-xs">
      {/* Left: status or context */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-emerald-700">Live Backend Connected</span>
        </div>
        {workshopId && (
          <div className="hidden sm:flex items-center gap-1.5 text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-full border border-slate-200">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-mono text-[11px] truncate max-w-[140px] text-slate-600">
              WS: {workshopId.substring(0, 8)}...
            </span>
          </div>
        )}
      </div>

      {/* Right: user badge and role */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-800 leading-tight">
            {employeeRole || userType || 'User'}
          </p>
          <span className="text-[11px] text-brand-red font-semibold uppercase tracking-wider">
            {userType === 'WorkshopOwner' ? 'Workshop Owner' : employeeRole || 'Employee'}
          </span>
        </div>

        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-red to-red-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-slate-100">
          {employeeRole ? employeeRole.charAt(0) : <User className="w-4 h-4" />}
        </div>
      </div>
    </header>
  )
}
