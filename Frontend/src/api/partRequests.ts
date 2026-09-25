import api from './axiosInstance'
import type { CreatePartRequestRequest, PartRequestResponse, PartRequestStatus } from '@/types'

export const partRequestsApi = {
  getByJobCard: (jobCardId: string) => api.get<PartRequestResponse[]>(`/api/job-cards/${jobCardId}/part-requests`).then((r) => r.data),
  create: (jobCardId: string, data: CreatePartRequestRequest) => api.post<PartRequestResponse>(`/api/job-cards/${jobCardId}/part-requests`, data).then((r) => r.data),
  getForWorkshop: (workshopId: string) => api.get<PartRequestResponse[]>(`/api/workshops/${workshopId}/part-requests`).then((r) => r.data),
  process: (workshopId: string, requestId: string, status: PartRequestStatus) => api.patch<PartRequestResponse>(`/api/workshops/${workshopId}/part-requests/${requestId}/status`, { status }).then((r) => r.data),
}
