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
  Warehouse,
  Settings,
  Car,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { hasPermission } from '@/utils/permissions'

interface NavItem {
  section: string
  name: string
  to: string
  icon: React.ReactNode
  permission: Parameters<typeof hasPermission>[2]
}

const navItems: NavItem[] = [
  { section: 'Workspace', name: 'Overview', to: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, permission: 'dashboard:view' },
  { section: 'Operations', name: 'Job Cards', to: '/jobs', icon: <ClipboardList className="w-4 h-4" />, permission: 'jobs:manage' },
  { section: 'Operations', name: 'Customers', to: '/customers', icon: <Users className="w-4 h-4" />, permission: 'customers:manage' },
  { section: 'Operations', name: 'Invoices & Billing', to: '/invoices', icon: <Receipt className="w-4 h-4" />, permission: 'billing:manage' },
  {
    section: 'People',
    name: 'Team Management',
    to: '/employees',
    icon: <UserCog className="w-4 h-4" />,
    permission: 'employees:manage',
  },
  { section: 'Workshop', name: 'Inventory & Parts', to: '/parts', icon: <Package className="w-4 h-4" />, permission: 'inventory:manage' },
  { section: 'Workshop', name: 'Parts Availability', to: '/inventory-availability', icon: <Package className="w-4 h-4" />, permission: 'inventory:view' },
  { section: 'Workshop', name: 'Services Catalog', to: '/services', icon: <Wrench className="w-4 h-4" />, permission: 'catalog:manage' },
  { section: 'Workshop', name: 'Workshop Settings', to: '/settings', icon: <Settings className="w-4 h-4" />, permission: 'workshop:manage' },
  { section: 'My Work', name: 'My Tasks', to: '/my-tasks', icon: <ClipboardList className="w-4 h-4" />, permission: 'tasks:view-assigned' },
  { section: 'My Work', name: 'Part Requests', to: '/parts-requests', icon: <Warehouse className="w-4 h-4" />, permission: 'parts:process' },
  { section: 'My Account', name: 'Customer Portal', to: '/my-account', icon: <Car className="w-4 h-4" />, permission: 'customer:profile-own' },
]

export const Sidebar: React.FC = () => {
  const { employeeRole, userType, clearAuth } = useAuthStore()

  // Filter items based on role if specified
  const filteredNavItems = navItems.filter((item) =>
    hasPermission(userType, employeeRole, item.permission),
  )
  const sections = [...new Set(filteredNavItems.map((item) => item.section))]

  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center gap-3 border-b border-slate-200 bg-white">
  <div className="w-8 h-8 flex items-center justify-center">
    <img src="logo_icon.png" alt="GarageOps" className="w-8 h-8 object-contain" />
  </div>
  <img
    src="logo_text.png"
    alt="GarageOps"
    className="h-5 w-auto object-contain"
  />
</div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-2.5 space-y-4 overflow-y-auto">
        {sections.map((section) => (
          <div key={section}>
            <div className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{section}</div>
            <div className="space-y-0.5">
              {filteredNavItems.filter((item) => item.section === section).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors group ${isActive
                      ? 'bg-rose-50 text-brand-red font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <span className="transition-transform duration-150 group-hover:scale-105">{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
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
