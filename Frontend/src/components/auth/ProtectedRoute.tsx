import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { EmployeeRole } from '@/types'

interface ProtectedRouteProps {
  allowedRoles?: EmployeeRole[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, userType, employeeRole } = useAuthStore()

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (userType === 'WorkshopOwner') {
      return <Outlet />
    }
    if (!employeeRole || !allowedRoles.includes(employeeRole)) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <Outlet />
}
