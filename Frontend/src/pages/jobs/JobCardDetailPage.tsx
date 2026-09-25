import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { jobCardsApi } from '@/api/jobCards'
import { jobTasksApi } from '@/api/jobTasks'
import { customersApi } from '@/api/customers'
import { employeesApi } from '@/api/employees'
import { invoicesApi } from '@/api/invoices'
import type {
  JobStatus,
  TaskStatus,
  CreateJobTaskRequest,
  CreateInvoiceRequest,
} from '@/types'
import { JOB_STATUSES, TASK_STATUSES } from '@/utils/constants'
import { formatDate } from '@/utils/formatting'
import { showToast } from '@/store/toastStore'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import {
  Car,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ArrowLeft,
  Receipt,
  UserCheck,
  ChevronRight,
} from 'lucide-react'

const taskSchema = z.object({
  title: z.string().min(2, 'Task title is required'),
  description: z.string().min(2, 'Description is required'),
  estimatedHours: z.coerce.number().min(0.1, 'Estimated hours required'),
})

type TaskFormValues = z.infer<typeof taskSchema>

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(2, 'Invoice number required'),
  subtotal: z.coerce.number().min(0, 'Subtotal required'),
  tax: z.coerce.number().min(0, 'Tax required'),
})

type InvoiceFormValues = z.infer<typeof invoiceSchema>

export const JobCardDetailPage: React.FC = () => {
  const { id: jobCardId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { workshopId } = useAuthStore()
  const queryClient = useQueryClient()

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [selectedStaffId, setSelectedStaffId] = useState<string>('')
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // Fetch job card
  const { data: jobCard, isLoading: jobLoading } = useQuery({
    queryKey: ['jobCard', workshopId, jobCardId],
    queryFn: () => jobCardsApi.getById(workshopId!, jobCardId!),
    enabled: !!workshopId && !!jobCardId,
  })

  // Fetch customer
  const { data: customer } = useQuery({
    queryKey: ['customer', workshopId, jobCard?.customerId],
    queryFn: () => customersApi.getById(workshopId!, jobCard!.customerId),
    enabled: !!workshopId && !!jobCard?.customerId,
  })

  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['jobTasks', workshopId, jobCardId],
    queryFn: () => jobTasksApi.getAll(workshopId!, jobCardId!),
    enabled: !!workshopId && !!jobCardId,
  })

  // Fetch employees for assigning
  const { data: employees = [] } = useQuery({
    queryKey: ['employees', workshopId],
    queryFn: () => employeesApi.getAll(workshopId!),
    enabled: !!workshopId,
  })

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: (status: JobStatus) =>
      jobCardsApi.updateStatus(workshopId!, jobCardId!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobCard', workshopId, jobCardId] })
      queryClient.invalidateQueries({ queryKey: ['jobCards', workshopId] })
      showToast('Job status updated', 'success')
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to update job status', 'error')
    },
  })

  const detailsSchema = z.object({
    title: z.string().min(2, 'Job title is required'),
    description: z.string().min(2, 'Description is required'),
    vehicleRegistrationNumber: z.string().min(1, 'Registration is required'),
    vehicleMake: z.string().min(1, 'Make is required'),
    vehicleModel: z.string().min(1, 'Model is required'),
    vehicleYear: z.coerce.number().int().min(1886).max(new Date().getFullYear() + 1),
  })
  type DetailsFormValues = z.input<typeof detailsSchema>
  const {
    register: registerDetails,
    handleSubmit: handleSubmitDetails,
    reset: resetDetails,
    formState: { errors: detailsErrors },
  } = useForm<DetailsFormValues>({ resolver: zodResolver(detailsSchema) })

  const updateDetailsMutation = useMutation({
    mutationFn: (data: DetailsFormValues) => jobCardsApi.updateDetails(
      workshopId!, jobCardId!, detailsSchema.parse(data) as Parameters<typeof jobCardsApi.updateDetails>[2],
    ),
    onSuccess: (updated) => {
      queryClient.setQueryData(['jobCard', workshopId, jobCardId], updated)
      queryClient.invalidateQueries({ queryKey: ['jobCards', workshopId] })
      showToast('Job and vehicle details updated', 'success')
      setIsDetailsModalOpen(false)
    },
    onError: (err: any) => showToast(err.response?.data?.message || 'Failed to update job details', 'error'),
  })

  const {
    register: registerTask,
    handleSubmit: handleSubmitTask,
    reset: resetTask,
    formState: { errors: taskErrors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
  })

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateJobTaskRequest) =>
      jobTasksApi.create(workshopId!, jobCardId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobTasks', workshopId, jobCardId] })
      showToast('Task added to job card', 'success')
      setIsTaskModalOpen(false)
      resetTask()
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to add task', 'error')
    },
  })

  const assignTaskMutation = useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
      jobTasksApi.assign(workshopId!, jobCardId!, taskId, { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobTasks', workshopId, jobCardId] })
      showToast('Task assigned successfully', 'success')
      setIsAssignModalOpen(false)
      setSelectedTaskId(null)
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to assign task', 'error')
    },
  })

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      jobTasksApi.updateStatus(workshopId!, jobCardId!, taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobTasks', workshopId, jobCardId] })
      showToast('Task status updated', 'success')
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to update task status', 'error')
    },
  })

  // Quick Invoice Creation Form
  const {
    register: registerInvoice,
    handleSubmit: handleSubmitInvoice,
    reset: resetInvoice,
    formState: { errors: invoiceErrors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      subtotal: 150,
      tax: 15,
    },
  })

  const createInvoiceMutation = useMutation({
    mutationFn: (data: CreateInvoiceRequest) => invoicesApi.create(workshopId!, data),
    onSuccess: (newInv) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', workshopId] })
      showToast('Invoice generated successfully', 'success')
      setIsInvoiceModalOpen(false)
      navigate(`/invoices/${newInv.id}`)
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to generate invoice', 'error')
    },
  })

  if (jobLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!jobCard) {
    return (
      <div className="text-center p-12">
        <h2 className="text-xl font-bold text-slate-900">Job Card Not Found</h2>
        <Button onClick={() => navigate('/jobs')} className="mt-4">
          Back to Jobs
        </Button>
      </div>
    )
  }

  // Employee mapping
  const employeeMap = new Map<string, string>()
  employees.forEach((e) => employeeMap.set(e.id, `${e.username} (${e.employeeRole})`))

  return (
    <div className="space-y-6 pb-12">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/jobs')}
            className="p-2 rounded-md bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded border border-slate-200">
                {jobCard.vehicleRegistrationNumber}
              </span>
              <StatusBadge status={jobCard.status} type="job" />
            </div>
            <h1 className="font-display text-2xl font-black text-slate-900 uppercase tracking-wide mt-1">
              {jobCard.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={() => {
            resetDetails({ title: jobCard.title, description: jobCard.description, vehicleRegistrationNumber: jobCard.vehicleRegistrationNumber, vehicleMake: jobCard.vehicleMake, vehicleModel: jobCard.vehicleModel, vehicleYear: jobCard.vehicleYear })
            setIsDetailsModalOpen(true)
          }}>
            Edit details
          </Button>
          <Button
            variant="sand"
            size="sm"
            leftIcon={<Receipt className="w-4 h-4" />}
            onClick={() => setIsInvoiceModalOpen(true)}
          >
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Vehicle & Customer Info */}
        <div className="space-y-6">
          {/* Vehicle Box */}
          <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-xl">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <Car className="w-4 h-4" /> Vehicle Specifications
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between pb-2 border-b border-slate-200/50">
                <span className="text-slate-500">License Plate:</span>
                <span className="font-mono font-bold text-slate-900">
                  {jobCard.vehicleRegistrationNumber}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200/50">
                <span className="text-slate-500">Make & Model:</span>
                <span className="font-medium text-slate-700">
                  {jobCard.vehicleMake} {jobCard.vehicleModel}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200/50">
                <span className="text-slate-500">Year:</span>
                <span className="font-medium text-slate-700">{jobCard.vehicleYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Logged On:</span>
                <span className="text-slate-700 text-xs">{formatDate(jobCard.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Customer Box */}
          <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-xl">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> Customer Contact
            </h3>
            {customer ? (
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-500 text-xs">Full Name</span>
                  <p className="font-semibold text-slate-900">
                    {customer.firstName} {customer.lastName}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Phone</span>
                  <p className="font-mono text-slate-700">{customer.phone}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Email</span>
                  <p className="text-slate-700 text-xs">{customer.email}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Billing Address</span>
                  <p className="text-slate-700 text-xs">{customer.address}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Customer details unavailable</p>
            )}
          </div>
        </div>

        {/* Right Column: Workflow Status & Tasks list */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Stepper Card */}
          <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-900">
                Workflow Status
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Advance Status:</span>
                <select
                  value={jobCard.status}
                  onChange={(e) => updateStatusMutation.mutate(e.target.value as JobStatus)}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-sand"
                >
                  {JOB_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/([A-Z])/g, ' $1').trim()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Description / Diagnostic findings:
            </p>
            <div className="p-3.5 rounded-md bg-white border border-slate-200 text-slate-700 text-sm leading-relaxed">
              {jobCard.description}
            </div>
          </div>

          {/* Tasks List Card */}
          <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <div>
                <h3 className="font-display text-base font-bold uppercase tracking-wider text-slate-900">
                  Job Tasks ({tasks.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Mechanic labor assignments and progress checklist
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsTaskModalOpen(true)}
              >
                Add Task
              </Button>
            </div>

            {tasksLoading ? (
              <div className="p-8 flex justify-center">
                <Spinner size="md" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No tasks assigned yet. Add specific labor tasks for mechanics to execute.
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-md bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={task.status} type="task" />
                        <h4 className="font-semibold text-slate-900 text-sm">{task.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{task.description}</p>
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2">
                        {task.estimatedHours && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" /> Est: {task.estimatedHours} hrs
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-slate-500" />
                          Assigned:{' '}
                          <strong className="text-slate-700">
                            {task.assignedToUserId
                              ? employeeMap.get(task.assignedToUserId) || 'Assigned Staff'
                              : 'Unassigned'}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedTaskId(task.id)
                          setIsAssignModalOpen(true)
                        }}
                      >
                        {task.assignedToUserId ? 'Reassign' : 'Assign'}
                      </Button>

                      {/* Quick Status Advance */}
                      <select
                        value={task.status}
                        onChange={(e) =>
                          updateTaskStatusMutation.mutate({
                            taskId: task.id,
                            status: e.target.value as TaskStatus,
                          })
                        }
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none"
                      >
                        {TASK_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title="Edit job and vehicle" size="md">
        <form onSubmit={handleSubmitDetails((values) => updateDetailsMutation.mutate(values))} className="space-y-4">
          <Input label="Job title" error={detailsErrors.title?.message} {...registerDetails('title')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Registration" error={detailsErrors.vehicleRegistrationNumber?.message} {...registerDetails('vehicleRegistrationNumber')} />
            <Input label="Make" error={detailsErrors.vehicleMake?.message} {...registerDetails('vehicleMake')} />
            <Input label="Model" error={detailsErrors.vehicleModel?.message} {...registerDetails('vehicleModel')} />
            <Input label="Year" type="number" error={detailsErrors.vehicleYear?.message} {...registerDetails('vehicleYear')} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Description / diagnostic findings</label>
            <textarea rows={3} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sand focus:ring-1 focus:ring-sand/40" {...registerDetails('description')} />
            {detailsErrors.description && <p className="mt-1 text-xs text-brand-red">{detailsErrors.description.message}</p>}
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsDetailsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={updateDetailsMutation.isPending}>Save changes</Button>
          </div>
        </form>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Add Job Task"
        size="md"
      >
        <form
          onSubmit={handleSubmitTask((val) => createTaskMutation.mutate(val as any))}
          className="space-y-4"
        >
          <Input
            label="Task Title"
            placeholder="e.g. Inspect Front Brake Rotors & Pads"
            error={taskErrors.title?.message}
            {...registerTask('title')}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Task Instructions
            </label>
            <textarea
              className="w-full bg-slate-50 border border-slate-300 focus:border-sand focus:ring-1 focus:ring-sand/40 text-slate-900 text-sm rounded-lg p-3 outline-none"
              rows={3}
              placeholder="Detail required steps, torque specs, or checks..."
              {...registerTask('description')}
            />
            {taskErrors.description && (
              <p className="text-xs text-brand-red font-medium mt-1">
                {taskErrors.description.message}
              </p>
            )}
          </div>

          <Input
            label="Estimated Hours"
            type="number"
            step="0.25"
            placeholder="1.5"
            error={taskErrors.estimatedHours?.message}
            {...registerTask('estimatedHours')}
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsTaskModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createTaskMutation.isPending}>
              Add Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Task Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Staff to Task"
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="Select Mechanic"
            placeholder="Choose staff member..."
            options={employees.filter((e) => e.isActive && (e.employeeRole === 'Mechanic' || e.employeeRole === 'Technician')).map((e) => ({
              value: e.id,
              label: `${e.username} (${e.employeeRole})`,
            }))}
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <Button
              variant="secondary"
              onClick={() => {
                setIsAssignModalOpen(false)
                setSelectedTaskId(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!selectedStaffId}
              isLoading={assignTaskMutation.isPending}
              onClick={() => {
                if (selectedTaskId && selectedStaffId) {
                  assignTaskMutation.mutate({
                    taskId: selectedTaskId,
                    userId: selectedStaffId,
                  })
                }
              }}
            >
              Assign
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quick Generate Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Generate Invoice for Job Card"
        size="md"
      >
        <form
          onSubmit={handleSubmitInvoice((val) =>
            createInvoiceMutation.mutate({
              jobCardId: jobCard.id,
              customerId: jobCard.customerId,
              invoiceNumber: val.invoiceNumber,
              subtotal: val.subtotal,
              tax: val.tax,
            })
          )}
          className="space-y-4"
        >
          <Input
            label="Invoice Reference Number"
            placeholder="INV-1002"
            error={invoiceErrors.invoiceNumber?.message}
            {...registerInvoice('invoiceNumber')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Subtotal Amount ($ / LKR)"
              type="number"
              step="0.01"
              error={invoiceErrors.subtotal?.message}
              {...registerInvoice('subtotal')}
            />
            <Input
              label="Tax Amount ($ / LKR)"
              type="number"
              step="0.01"
              error={invoiceErrors.tax?.message}
              {...registerInvoice('tax')}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsInvoiceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="sand"
              isLoading={createInvoiceMutation.isPending}
            >
              Generate & Finalize Invoice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
