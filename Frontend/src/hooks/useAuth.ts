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

  const isAdmin = userType === 'WorkshopAdmin'
  const isFrontDesk = isAdmin || employeeRole === 'FrontDesk' || employeeRole === 'Manager'

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
    isAdmin,
    isFrontDesk,
  }
}
