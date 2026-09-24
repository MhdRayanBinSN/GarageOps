import api from './axiosInstance'
import type { LoginRequest, LoginResponse, WorkshopRegistrationRequest, WorkshopRegistrationResponse } from '@/types'

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/api/auth/login', data).then((r) => r.data),

  register: (data: WorkshopRegistrationRequest) =>
    api.post<WorkshopRegistrationResponse>('/api/workshops/registration', data).then((r) => r.data),
}
