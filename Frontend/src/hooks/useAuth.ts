import { useAuthStore } from '@/store/authStore'

export const useAuth = () => {
  const {
    userId,
    workshopId,
    userType,
    employeeRole,
    accessToken,
    expiresAt,
    setAuth,
    clearAuth,
    isAuthenticated,
  } = useAuthStore()

  const isOwner = userType === 'WorkshopOwner' || employeeRole === 'Owner'
  const isManager = isOwner || employeeRole === 'Manager'
  const isAdvisor = isManager || employeeRole === 'ServiceAdvisor'

  return {
    userId,
    workshopId,
    userType,
    employeeRole,
    accessToken,
    expiresAt,
    setAuth,
    clearAuth,
    isAuthenticated: isAuthenticated(),
    isOwner,
    isManager,
    isAdvisor,
  }
}
