import api from './axiosInstance'
import type { InventoryAvailabilityResponse } from '@/types'

export const inventoryApi = {
  getAvailability: (workshopId: string) => api.get<InventoryAvailabilityResponse[]>(`/api/workshops/${workshopId}/inventory-availability`).then((r) => r.data),
}
