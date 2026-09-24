import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { invoicesApi } from '@/api/invoices'
import { customersApi } from '@/api/customers'
import { jobCardsApi } from '@/api/jobCards'
import type { PaymentMethod, CreatePaymentRequest } from '@/types'
import { PAYMENT_METHODS } from '@/utils/constants'
import { formatCurrency, formatDate } from '@/utils/formatting'
import { showToast } from '@/store/toastStore'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import {
  ArrowLeft,
  Receipt,
  CreditCard,
  CheckCircle2,
  Printer,
  Car,
  User,
  ShieldCheck,
} from 'lucide-react'

const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Payment amount must be greater than zero'),
  method: z.enum(['Cash', 'Card', 'BankTransfer']),
})

type PaymentFormValues = z.infer<typeof paymentSchema>

export const InvoiceDetailPage: React.FC = () => {
  const { id: invoiceId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { workshopId } = useAuthStore()
  const queryClient = useQueryClient()
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // Fetch invoice
  const { data: invoice, isLoading: invoiceLoading } = useQuery({
    queryKey: ['invoice', workshopId, invoiceId],
    queryFn: () => invoicesApi.getById(workshopId!, invoiceId!),
    enabled: !!workshopId && !!invoiceId,
  })

  // Fetch customer
  const { data: customer } = useQuery({
    queryKey: ['customer', workshopId, invoice?.customerId],
    queryFn: () => customersApi.getById(workshopId!, invoice!.customerId),
    enabled: !!workshopId && !!invoice?.customerId,
  })

  // Fetch job card
  const { data: jobCard } = useQuery({
    queryKey: ['jobCard', workshopId, invoice?.jobCardId],
    queryFn: () => jobCardsApi.getById(workshopId!, invoice!.jobCardId),
    enabled: !!workshopId && !!invoice?.jobCardId,
  })

  // Mutations
  const finalizeMutation = useMutation({
    mutationFn: () => invoicesApi.finalize(workshopId!, invoiceId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', workshopId, invoiceId] })
      queryClient.invalidateQueries({ queryKey: ['invoices', workshopId] })
      showToast('Invoice finalized successfully', 'success')
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to finalize invoice', 'error')
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: invoice?.total || 0,
      method: 'Card',
    },
  })

  const paymentMutation = useMutation({
    mutationFn: (data: CreatePaymentRequest) =>
      invoicesApi.addPayment(workshopId!, invoiceId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', workshopId, invoiceId] })
      queryClient.invalidateQueries({ queryKey: ['invoices', workshopId] })
      showToast('Payment recorded successfully', 'success')
      setIsPaymentModalOpen(false)
      reset()
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to record payment', 'error')
    },
  })

  if (invoiceLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center p-12">
        <h2 className="text-xl font-bold text-slate-900">Invoice Not Found</h2>
        <Button onClick={() => navigate('/invoices')} className="mt-4">
          Back to Invoices
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/invoices')}
            className="p-2 rounded-md bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-slate-900">
                {invoice.invoiceNumber}
              </span>
              <StatusBadge status={invoice.status} type="invoice" />
            </div>
            <h1 className="font-display text-2xl font-black text-slate-900 uppercase tracking-wide mt-1">
              Billing Statement
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            Print
          </Button>

          {invoice.status === 'Draft' && (
            <Button
              variant="sand"
              size="sm"
              isLoading={finalizeMutation.isPending}
              onClick={() => finalizeMutation.mutate()}
            >
              Finalize Invoice
            </Button>
          )}

          {invoice.status === 'Finalized' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CreditCard className="w-4 h-4" />}
              onClick={() => {
                reset({
                  amount: invoice.total,
                  method: 'Card',
                })
                setIsPaymentModalOpen(true)
              }}
            >
              Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Document Card */}
      <div className="p-8 sm:p-10 rounded-lg bg-white border border-slate-200 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Subtle Watermark for Paid */}
        {invoice.status === 'Paid' && (
          <div className="absolute right-8 top-8 rotate-12 border-4 border-emerald-500/40 text-emerald-400 font-black font-display text-4xl px-4 py-1.5 rounded-md uppercase tracking-widest pointer-events-none select-none">
            PAID IN FULL
          </div>
        )}

        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between pb-8 border-b border-slate-200 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-brand-red flex items-center justify-center text-slate-900">
                <Receipt className="w-5 h-5" />
              </div>
              <span className="font-display text-xl font-bold tracking-wider text-slate-900">
                GARAGE<span className="text-brand-red">OPS</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">Automotive Diagnostics & Repair Services</p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-semibold uppercase text-slate-500">Invoice No.</span>
            <p className="font-mono text-xl font-bold text-slate-500">{invoice.invoiceNumber}</p>
            <p className="text-xs text-slate-500 mt-1">Status: {invoice.status}</p>
          </div>
        </div>

        {/* Customer & Job Card Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
              <User className="w-3.5 h-3.5" /> Billed To
            </span>
            {customer ? (
              <div className="text-sm space-y-1">
                <p className="font-bold text-slate-900">
                  {customer.firstName} {customer.lastName}
                </p>
                <p className="text-slate-700 text-xs">{customer.address}</p>
                <p className="text-slate-500 text-xs font-mono">{customer.phone}</p>
                <p className="text-slate-500 text-xs">{customer.email}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Customer details unavailable</p>
            )}
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
              <Car className="w-3.5 h-3.5" /> Job Card Reference
            </span>
            {jobCard ? (
              <div className="text-sm space-y-1">
                <p className="font-bold font-mono text-slate-900">
                  {jobCard.vehicleRegistrationNumber}
                </p>
                <p className="text-slate-700 text-xs">
                  {jobCard.vehicleMake} {jobCard.vehicleModel} ({jobCard.vehicleYear})
                </p>
                <p className="text-slate-500 text-xs">{jobCard.title}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Job details unavailable</p>
            )}
          </div>
        </div>

        {/* Line Items / Calculation Breakdown */}
        <div className="py-8 border-b border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="pb-3">Description</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-700/50">
                <tr>
                  <td className="py-4 text-slate-700">
                    Workshop Labor, Diagnostics & Assigned Job Tasks
                  </td>
                  <td className="py-4 text-right font-mono font-semibold text-slate-900">
                    {formatCurrency(invoice.subtotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Section */}
        <div className="pt-6 flex justify-end">
          <div className="w-72 space-y-3">
            <div className="flex justify-between text-sm text-slate-700">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-700">
              <span>Tax / VAT:</span>
              <span className="font-mono font-semibold">{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t border-slate-200">
              <span className="uppercase tracking-wider">Total Due:</span>
              <span className="font-mono text-slate-500 text-lg font-black">
                {formatCurrency(invoice.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Payment Settlement"
        size="sm"
      >
        <form
          onSubmit={handleSubmit((val) =>
            paymentMutation.mutate({
              amount: val.amount,
              method: val.method,
            })
          )}
          className="space-y-4"
        >
          <Input
            label="Payment Amount"
            type="number"
            step="0.01"
            error={errors.amount?.message}
            {...register('amount')}
          />

          <Select
            label="Payment Method"
            options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))}
            error={errors.method?.message}
            {...register('method')}
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsPaymentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={paymentMutation.isPending}
            >
              Confirm Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
