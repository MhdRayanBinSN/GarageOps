import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserType, EmployeeRole } from '@/types'

interface AuthState {
  userId: string | null
  workshopId: string | null
  userType: UserType | null
  employeeRole: EmployeeRole | null
  accessToken: string | null
  expiresAt: string | null
  setAuth: (payload: {
    userId: string
    workshopId: string | null
    userType: UserType
    employeeRole: EmployeeRole | null
    accessToken: string
    expiresAt: string
  }) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      userId: null,
      workshopId: null,
      userType: null,
      employeeRole: null,
      accessToken: null,
      expiresAt: null,

      setAuth: (payload) =>
        set({
          userId: payload.userId,
          workshopId: payload.workshopId,
          userType: payload.userType,
          employeeRole: payload.employeeRole,
          accessToken: payload.accessToken,
          expiresAt: payload.expiresAt,
        }),

      clearAuth: () =>
        set({
          userId: null,
          workshopId: null,
          userType: null,
          employeeRole: null,
          accessToken: null,
          expiresAt: null,
        }),

      isAuthenticated: () => {
        const { accessToken, expiresAt } = get()
        if (!accessToken || !expiresAt) return false
        return new Date(expiresAt) > new Date()
      },
    }),
    { name: 'garageops-auth' }
  )
)
