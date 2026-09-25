import api from './axiosInstance'

export interface WorkshopDetails {
  id: string
  name: string
  phone: string
  email: string
  address: string
}

export interface UpdateWorkshopRequest {
  name: string
  phone: string
  email: string
  address: string
}

export const workshopsApi = {
  get: (workshopId: string) => api.get<WorkshopDetails>(`/api/workshops/${workshopId}`).then((r) => r.data),
  update: (workshopId: string, data: UpdateWorkshopRequest) => api.put<WorkshopDetails>(`/api/workshops/${workshopId}`, data).then((r) => r.data),
}
