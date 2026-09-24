import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Package,
  Wrench,
  Receipt,
  UserCog,
  LogOut,
  Car,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface NavItem {
  name: string
  to: string
  icon: React.ReactNode
  roles?: string[]
}

const navItems: NavItem[] = [
  { name: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { name: 'Job Cards', to: '/jobs', icon: <ClipboardList className="w-5 h-5" /> },
  { name: 'Customers', to: '/customers', icon: <Users className="w-5 h-5" /> },
  { name: 'Inventory & Parts', to: '/parts', icon: <Package className="w-5 h-5" /> },
  { name: 'Services Catalog', to: '/services', icon: <Wrench className="w-5 h-5" /> },
  { name: 'Invoices & Billing', to: '/invoices', icon: <Receipt className="w-5 h-5" /> },
  {
    name: 'Team Management',
    to: '/employees',
    icon: <UserCog className="w-5 h-5" />,
    roles: ['Owner', 'Manager'],
  },
]

export const Sidebar: React.FC = () => {
  const { employeeRole, userType, clearAuth } = useAuthStore()

  // Filter items based on role if specified
  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true
    if (userType === 'WorkshopOwner') return true
    return employeeRole && item.roles.includes(employeeRole)
  })

  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-14 px-5 flex items-center gap-3 border-b border-slate-200 bg-white">
        <div className="w-8 h-8 rounded-md bg-brand-red flex items-center justify-center text-white">
          <Car className="w-5 h-5" />
        </div>
        <div>
          <span className="font-display text-base font-bold tracking-wider text-slate-900 flex items-center gap-1">
            GARAGE<span className="text-brand-red">OPS</span>
          </span>
          <span className="block text-[10px] uppercase tracking-widest text-slate-500 font-semibold -mt-1">
            Workshop Suite
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Menu
        </div>
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-rose-50 text-brand-red font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`
            }
          >
            <span className="transition-transform duration-200 group-hover:scale-110">
              {item.icon}
            </span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-200">
        <button
          onClick={clearAuth}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-brand-red hover:bg-rose-50 transition-all duration-150"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
