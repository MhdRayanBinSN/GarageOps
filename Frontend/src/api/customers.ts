import api from './axiosInstance'
import type { CreateCustomerRequest, UpdateCustomerRequest, CustomerResponse } from '@/types'

export const customersApi = {
  getAll: (workshopId: string) =>
    api.get<CustomerResponse[]>(`/api/workshops/${workshopId}/customers`).then((r) => r.data),

  getById: (workshopId: string, customerId: string) =>
    api.get<CustomerResponse>(`/api/workshops/${workshopId}/customers/${customerId}`).then((r) => r.data),

  create: (workshopId: string, data: CreateCustomerRequest) =>
    api.post<CustomerResponse>(`/api/workshops/${workshopId}/customers`, data).then((r) => r.data),

  update: (workshopId: string, customerId: string, data: UpdateCustomerRequest) =>
    api.put<CustomerResponse>(`/api/workshops/${workshopId}/customers/${customerId}`, data).then((r) => r.data),

  delete: (workshopId: string, customerId: string) =>
    api.delete<void>(`/api/workshops/${workshopId}/customers/${customerId}`).then((r) => r.data),
}
