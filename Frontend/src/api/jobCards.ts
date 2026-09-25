import api from './axiosInstance'
import type { CreateJobCardRequest, UpdateJobStatusRequest, JobCardResponse } from '@/types'

export const jobCardsApi = {
  getAll: (workshopId: string) =>
    api.get<JobCardResponse[]>(`/api/workshops/${workshopId}/job-cards`).then((r) => r.data),

  getById: (workshopId: string, jobCardId: string) =>
    api.get<JobCardResponse>(`/api/workshops/${workshopId}/job-cards/${jobCardId}`).then((r) => r.data),

  create: (workshopId: string, data: CreateJobCardRequest) =>
    api.post<JobCardResponse>(`/api/workshops/${workshopId}/job-cards`, data).then((r) => r.data),

  updateStatus: (workshopId: string, jobCardId: string, data: UpdateJobStatusRequest) =>
    api.put<JobCardResponse>(`/api/workshops/${workshopId}/job-cards/${jobCardId}/status`, data).then((r) => r.data),

  updateDetails: (workshopId: string, jobCardId: string, data: {
    title: string
    description: string
    vehicleRegistrationNumber: string
    vehicleMake: string
    vehicleModel: string
    vehicleYear: number
  }) => api.put<JobCardResponse>(`/api/workshops/${workshopId}/job-cards/${jobCardId}/details`, data).then((r) => r.data),
}
