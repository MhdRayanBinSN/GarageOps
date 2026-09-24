import api from './axiosInstance'
import type {
  CreatePartRequest,
  UpdatePartRequest,
  AdjustStockRequest,
  PartResponse,
} from '@/types'

export const partsApi = {
  getAll: (workshopId: string) =>
    api.get<PartResponse[]>(`/api/workshops/${workshopId}/parts`).then((r) => r.data),

  create: (workshopId: string, data: CreatePartRequest) =>
    api.post<PartResponse>(`/api/workshops/${workshopId}/parts`, data).then((r) => r.data),

  update: (workshopId: string, partId: string, data: UpdatePartRequest) =>
    api.put<PartResponse>(`/api/workshops/${workshopId}/parts/${partId}`, data).then((r) => r.data),

  adjustStock: (workshopId: string, partId: string, data: AdjustStockRequest) =>
    api.patch<PartResponse>(`/api/workshops/${workshopId}/parts/${partId}/stock`, data).then((r) => r.data),

  delete: (workshopId: string, partId: string) =>
    api.delete<void>(`/api/workshops/${workshopId}/parts/${partId}`).then((r) => r.data),
}
