import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { invoicesApi } from '@/api/invoices'
import { customersApi } from '@/api/customers'
import { jobCardsApi } from '@/api/jobCards'
import type { InvoiceResponse, CreateInvoiceRequest } from '@/types'
import { INVOICE_STATUSES } from '@/utils/constants'
import { formatCurrency } from '@/utils/formatting'
import { showToast } from '@/store/toastStore'
import { Table, Column } from '@/components/ui/Table'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Receipt, Plus, Search, ArrowRight, DollarSign } from 'lucide-react'

const invoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  jobCardId: z.string().min(1, 'Job Card is required'),
  invoiceNumber: z.string().min(2, 'Invoice number is required'),
  subtotal: z.coerce.number().min(0, 'Subtotal must be positive'),
  tax: z.coerce.number().min(0, 'Tax must be positive'),
})

type InvoiceFormValues = z.infer<typeof invoiceSchema>

export const InvoicesPage: React.FC = () => {
  const { workshopId } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', workshopId],
    queryFn: () => invoicesApi.getAll(workshopId!),
    enabled: !!workshopId,
  })

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', workshopId],
    queryFn: () => customersApi.getAll(workshopId!),
    enabled: !!workshopId,
  })

  const { data: jobCards = [] } = useQuery({
    queryKey: ['jobCards', workshopId],
    queryFn: () => jobCardsApi.getAll(workshopId!),
    enabled: !!workshopId,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      subtotal: 0,
      tax: 0,
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateInvoiceRequest) => invoicesApi.create(workshopId!, data),
    onSuccess: (newInv) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', workshopId] })
      showToast('Invoice generated', 'success')
      closeModal()
      navigate(`/invoices/${newInv.id}`)
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to create invoice', 'error')
    },
  })

  const closeModal = () => {
    setIsModalOpen(false)
    reset()
  }

  const onSubmit = (values: InvoiceFormValues) => {
    createMutation.mutate(values as any)
  }

  const customerMap = React.useMemo(() => {
    const map = new Map<string, string>()
    customers.forEach((c) => map.set(c.id, `${c.firstName} ${c.lastName}`))
    return map
  }, [customers])

  const jobCardMap = React.useMemo(() => {
    const map = new Map<string, string>()
    jobCards.forEach((j) => map.set(j.id, `${j.vehicleRegistrationNumber} - ${j.title}`))
    return map
  }, [jobCards])

  const filteredInvoices = invoices.filter((i) => {
    const matchesSearch =
      i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (customerMap.get(i.customerId)?.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchesStatus = statusFilter === 'ALL' || i.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const columns: Column<InvoiceResponse>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (i) => (
        <div>
          <span className="font-mono font-bold text-slate-900 text-sm">{i.invoiceNumber}</span>
          <span className="block text-xs text-slate-500">
            {jobCardMap.get(i.jobCardId) || 'Job Reference'}
          </span>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (i) => (
        <span className="font-medium text-slate-700">
          {customerMap.get(i.customerId) || 'Client'}
        </span>
      ),
    },
    {
      key: 'subtotal',
      header: 'Subtotal / Tax',
      render: (i) => (
        <div className="text-xs text-slate-500 font-mono">
          <div>Sub: {formatCurrency(i.subtotal)}</div>
          <div>Tax: {formatCurrency(i.tax)}</div>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total Amount',
      render: (i) => (
        <span className="font-bold font-mono text-slate-500 text-base">
          {formatCurrency(i.total)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (i) => <StatusBadge status={i.status} type="invoice" />,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      render: (i) => (
        <Button
          size="sm"
          variant="ghost"
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          onClick={() => navigate(`/invoices/${i.id}`)}
        >
          View
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black tracking-wide text-slate-900 uppercase flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-brand-red" />
            Invoices & Billing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage billing statements, tax breakdowns, and payment settlements
          </p>
        </div>
        <Button
          onClick={() => {
            reset({
              invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
              subtotal: 0,
              tax: 0,
            })
            setIsModalOpen(true)
          }}
          leftIcon={<Plus className="w-4 h-4" />}
          variant="primary"
          size="sm"
        >
          Create Invoice
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="max-w-md w-full">
          <Input
            placeholder="Search by invoice number or customer..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-sand text-ink font-bold shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            All Invoices ({invoices.length})
          </button>
          {INVOICE_STATUSES.map((st) => {
            const count = invoices.filter((i) => i.status === st).length
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-brand-red text-white shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200'
                }`}
              >
                {st} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredInvoices}
        keyExtractor={(i) => i.id}
        isLoading={isLoading}
        emptyMessage="No invoices found matching criteria"
        emptyActionLabel="Create First Invoice"
        onEmptyAction={() => setIsModalOpen(true)}
        onRowClick={(i) => navigate(`/invoices/${i.id}`)}
      />

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Create New Invoice"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Invoice Number"
            placeholder="e.g. INV-1001"
            error={errors.invoiceNumber?.message}
            {...register('invoiceNumber')}
          />

          <Select
            label="Customer"
            placeholder="Select customer..."
            options={customers.map((c) => ({
              value: c.id,
              label: `${c.firstName} ${c.lastName}`,
            }))}
            error={errors.customerId?.message}
            {...register('customerId')}
          />

          <Select
            label="Associated Job Card"
            placeholder="Select job card..."
            options={jobCards.map((j) => ({
              value: j.id,
              label: `${j.vehicleRegistrationNumber} - ${j.title}`,
            }))}
            error={errors.jobCardId?.message}
            {...register('jobCardId')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Subtotal ($ / LKR)"
              type="number"
              step="0.01"
              error={errors.subtotal?.message}
              {...register('subtotal')}
            />

            <Input
              label="Tax ($ / LKR)"
              type="number"
              step="0.01"
              error={errors.tax?.message}
              {...register('tax')}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
              Create Invoice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
