import api from './axiosInstance'
import type { CreateServiceRequest, UpdateServiceRequest, ServiceResponse } from '@/types'

export const servicesApi = {
  getAll: (workshopId: string) =>
    api.get<ServiceResponse[]>(`/api/workshops/${workshopId}/services`).then((r) => r.data),

  create: (workshopId: string, data: CreateServiceRequest) =>
    api.post<ServiceResponse>(`/api/workshops/${workshopId}/services`, data).then((r) => r.data),

  update: (workshopId: string, serviceId: string, data: UpdateServiceRequest) =>
    api.put<ServiceResponse>(`/api/workshops/${workshopId}/services/${serviceId}`, data).then((r) => r.data),

  delete: (workshopId: string, serviceId: string) =>
    api.delete<void>(`/api/workshops/${workshopId}/services/${serviceId}`).then((r) => r.data),
}
