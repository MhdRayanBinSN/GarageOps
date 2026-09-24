import type { EmployeeRole, JobStatus, TaskStatus, InvoiceStatus, PaymentMethod } from '@/types'

export const EMPLOYEE_ROLES: EmployeeRole[] = [
  'Owner',
  'Manager',
  'ServiceAdvisor',
  'Mechanic',
  'Technician',
]

export const JOB_STATUSES: JobStatus[] = [
  'Draft',
  'Received',
  'Diagnosing',
  'AwaitingApproval',
  'Approved',
  'InProgress',
  'QualityCheck',
  'ReadyForDelivery',
  'Completed',
  'Cancelled',
]

export const TASK_STATUSES: TaskStatus[] = [
  'Pending',
  'Assigned',
  'InProgress',
  'Completed',
  'Cancelled',
]

export const INVOICE_STATUSES: InvoiceStatus[] = ['Draft', 'Finalized', 'Paid', 'Cancelled']

export const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Card', 'BankTransfer']

export const LOW_STOCK_THRESHOLD = 5

// Status → badge color mapping (Tailwind classes)
export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  Draft: 'bg-slate-100 text-slate-700 border border-slate-200',
  Received: 'bg-sky-50 text-sky-700 border border-sky-200',
  Diagnosing: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  AwaitingApproval: 'bg-amber-50 text-amber-700 border border-amber-200',
  Approved: 'bg-blue-50 text-blue-700 border border-blue-200',
  InProgress: 'bg-rose-50 text-brand-red border border-rose-200',
  QualityCheck: 'bg-purple-50 text-purple-700 border border-purple-200',
  ReadyForDelivery: 'bg-teal-50 text-teal-700 border border-teal-200',
  Completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Cancelled: 'bg-slate-100 text-slate-500 border border-slate-200',
}

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  Pending: 'bg-slate-100 text-slate-700 border border-slate-200',
  Assigned: 'bg-sky-50 text-sky-700 border border-sky-200',
  InProgress: 'bg-rose-50 text-brand-red border border-rose-200',
  Completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Cancelled: 'bg-slate-100 text-slate-500 border border-slate-200',
}

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  Draft: 'bg-slate-100 text-slate-700 border border-slate-200',
  Finalized: 'bg-sky-50 text-sky-700 border border-sky-200',
  Paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Cancelled: 'bg-slate-100 text-slate-500 border border-slate-200',
}
