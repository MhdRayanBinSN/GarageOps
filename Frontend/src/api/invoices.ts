import api from './axiosInstance'
import type {
  CreateInvoiceRequest,
  CreatePaymentRequest,
  InvoiceResponse,
  PaymentResponse,
} from '@/types'

export const invoicesApi = {
  getAll: (workshopId: string) =>
    api.get<InvoiceResponse[]>(`/api/workshops/${workshopId}/invoices`).then((r) => r.data),

  getById: (workshopId: string, invoiceId: string) =>
    api.get<InvoiceResponse>(`/api/workshops/${workshopId}/invoices/${invoiceId}`).then((r) => r.data),

  create: (workshopId: string, data: CreateInvoiceRequest) =>
    api.post<InvoiceResponse>(`/api/workshops/${workshopId}/invoices`, data).then((r) => r.data),

  finalize: (workshopId: string, invoiceId: string) =>
    api.put<InvoiceResponse>(`/api/workshops/${workshopId}/invoices/${invoiceId}/finalize`).then((r) => r.data),

  addPayment: (workshopId: string, invoiceId: string, data: CreatePaymentRequest) =>
    api.post<PaymentResponse>(`/api/workshops/${workshopId}/invoices/${invoiceId}/payments`, data).then((r) => r.data),
}
