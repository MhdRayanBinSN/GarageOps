import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { AccessRole } from '@/types'
import { getAccessRole, getHomePath } from '@/utils/permissions'

interface ProtectedRouteProps {
  allowedRoles?: AccessRole[]
  children?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, userType, employeeRole } = useAuthStore()

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const effectiveRole = getAccessRole(userType, employeeRole)
    if (!effectiveRole || !allowedRoles.includes(effectiveRole)) {
      return <Navigate to={getHomePath(userType, employeeRole)} replace />
    }
  }

  return <>{children ?? <Outlet />}</>
}
