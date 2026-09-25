import api from './axiosInstance'
import type { CustomerPortalInvoice, CustomerPortalJob, CustomerPortalPayment, CustomerPortalProfile, CustomerPortalVehicle } from '@/types'

export const customerPortalApi = {
  getProfile: () => api.get<CustomerPortalProfile>('/api/customer-portal/me').then((r) => r.data),
  getJobs: () => api.get<CustomerPortalJob[]>('/api/customer-portal/jobs').then((r) => r.data),
  getInvoices: () => api.get<CustomerPortalInvoice[]>('/api/customer-portal/invoices').then((r) => r.data),
  getPayments: () => api.get<CustomerPortalPayment[]>('/api/customer-portal/payments').then((r) => r.data),
  getVehicles: () => api.get<CustomerPortalVehicle[]>('/api/customer-portal/vehicles').then((r) => r.data),
}
