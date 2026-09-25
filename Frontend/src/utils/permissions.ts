import type { AccessRole, EmployeeRole, UserType } from '@/types'

export type Permission =
  | 'dashboard:view' | 'workshop:manage' | 'employees:view' | 'employees:manage'
  | 'customers:manage' | 'jobs:view-all' | 'jobs:manage' | 'tasks:view-all'
  | 'tasks:view-assigned' | 'tasks:read' | 'tasks:manage' | 'tasks:assign'
  | 'tasks:update-assigned' | 'inventory:view' | 'inventory:manage'
  | 'catalog:view' | 'catalog:manage' | 'parts:request' | 'parts:process'
  | 'parts:workflow-view' | 'billing:manage' | 'customer:profile-own'
  | 'customer:jobs-own' | 'customer:invoices-own' | 'customer:payments-own'

const adminPermissions: Permission[] = [
  'dashboard:view', 'workshop:manage', 'employees:view', 'employees:manage',
  'customers:manage', 'jobs:view-all', 'jobs:manage', 'tasks:view-all',
  'tasks:read', 'tasks:manage', 'tasks:assign', 'tasks:update-assigned',
  'inventory:view', 'inventory:manage', 'catalog:view', 'catalog:manage',
  'parts:request', 'parts:process', 'parts:workflow-view', 'billing:manage',
]

const frontDeskPermissions: Permission[] = [
  'dashboard:view', 'employees:view', 'customers:manage', 'jobs:view-all', 'jobs:manage',
  'tasks:view-all', 'tasks:read', 'tasks:manage', 'tasks:assign',
  'tasks:update-assigned', 'inventory:view', 'catalog:view',
  'parts:process', 'parts:workflow-view', 'billing:manage',
]

const mechanicPermissions: Permission[] = [
  'tasks:view-assigned', 'tasks:read', 'tasks:update-assigned',
  'inventory:view', 'parts:request', 'parts:workflow-view',
]

const customerPermissions: Permission[] = [
  'customer:profile-own', 'customer:jobs-own', 'customer:invoices-own', 'customer:payments-own',
]

function canonicalRole(userType: UserType | null, role: EmployeeRole | null): AccessRole | null {
  if (userType === 'WorkshopAdmin') return 'Admin'
  if (userType === 'Customer') return 'Customer'
  if (role === 'FrontDesk' || role === 'Manager') return 'FrontDesk'
  if (role === 'Mechanic' || role === 'Technician') return 'Mechanic'
  if (role === 'InventoryStaff') return 'InventoryStaff'
  return null
}

const rolePermissions: Record<AccessRole, Permission[]> = {
  Admin: adminPermissions,
  FrontDesk: frontDeskPermissions,
  Mechanic: mechanicPermissions,
  Customer: customerPermissions,
  // Read existing legacy accounts without offering the role for new employees.
  InventoryStaff: ['inventory:view', 'inventory:manage', 'catalog:manage', 'parts:process'],
}

export function hasPermission(userType: UserType | null, role: EmployeeRole | null, permission: Permission) {
  const canonical = canonicalRole(userType, role)
  return canonical ? rolePermissions[canonical].includes(permission) : false
}

export function getHomePath(userType: UserType | null, role: EmployeeRole | null) {
  const canonical = canonicalRole(userType, role)
  if (canonical === 'Admin') return '/dashboard'
  if (canonical === 'FrontDesk') return '/dashboard'
  if (canonical === 'Customer') return '/my-account'
  if (canonical === 'Mechanic') return '/my-tasks'
  if (canonical === 'InventoryStaff') return '/parts-requests'
  return '/jobs'
}

export function getAccessRole(userType: UserType | null, role: EmployeeRole | null) {
  return canonicalRole(userType, role)
}
