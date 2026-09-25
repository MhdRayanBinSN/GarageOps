import React from 'react'
import type { JobStatus, TaskStatus, InvoiceStatus } from '@/types'
import { JOB_STATUS_COLORS, TASK_STATUS_COLORS, INVOICE_STATUS_COLORS } from '@/utils/constants'

type StatusType = JobStatus | TaskStatus | InvoiceStatus | string

interface StatusBadgeProps {
  status: StatusType
  type?: 'job' | 'task' | 'invoice' | 'generic'
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'generic', className = '' }) => {
  let colorClass = 'bg-slate-100 text-slate-700 border border-slate-300'

  if (type === 'job' && status in JOB_STATUS_COLORS) {
    colorClass = JOB_STATUS_COLORS[status as JobStatus]
  } else if (type === 'task' && status in TASK_STATUS_COLORS) {
    colorClass = TASK_STATUS_COLORS[status as TaskStatus]
  } else if (type === 'invoice' && status in INVOICE_STATUS_COLORS) {
    colorClass = INVOICE_STATUS_COLORS[status as InvoiceStatus]
  } else {
    if (status in JOB_STATUS_COLORS) colorClass = JOB_STATUS_COLORS[status as JobStatus]
    else if (status in TASK_STATUS_COLORS) colorClass = TASK_STATUS_COLORS[status as TaskStatus]
    else if (status in INVOICE_STATUS_COLORS) colorClass = INVOICE_STATUS_COLORS[status as InvoiceStatus]
  }

  if (type === 'generic') {
    if (status === 'Approved' || status === 'Issued') colorClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    if (status === 'Rejected') colorClass = 'bg-rose-50 text-rose-700 border border-rose-200'
    if (status === 'Pending') colorClass = 'bg-amber-50 text-amber-700 border border-amber-200'
  }

  // Format camelCase to readable words e.g. AwaitingApproval -> Awaiting Approval
  const formattedText = status.replace(/([A-Z])/g, ' $1').trim()

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase shadow-sm ${colorClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {formattedText}
    </span>
  )
}
