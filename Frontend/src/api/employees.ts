import api from './axiosInstance'
import type { CreateEmployeeRequest, UpdateEmployeeRoleRequest, EmployeeResponse } from '@/types'

export const employeesApi = {
  getAll: (workshopId: string) =>
    api.get<EmployeeResponse[]>(`/api/workshops/${workshopId}/employees`).then((r) => r.data),

  create: (workshopId: string, data: CreateEmployeeRequest) =>
    api.post<EmployeeResponse>(`/api/workshops/${workshopId}/employees`, data).then((r) => r.data),

  updateRole: (workshopId: string, employeeId: string, data: UpdateEmployeeRoleRequest) =>
    api.put<EmployeeResponse>(`/api/workshops/${workshopId}/employees/${employeeId}/role`, data).then((r) => r.data),

  deactivate: (workshopId: string, employeeId: string) =>
    api.patch<void>(`/api/workshops/${workshopId}/employees/${employeeId}/deactivate`).then((r) => r.data),
  activate: (workshopId: string, employeeId: string) =>
    api.patch<void>(`/api/workshops/${workshopId}/employees/${employeeId}/activate`).then((r) => r.data),
}
