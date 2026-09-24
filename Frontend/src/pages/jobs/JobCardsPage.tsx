import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { jobCardsApi } from '@/api/jobCards'
import { customersApi } from '@/api/customers'
import type { JobCardResponse, CreateJobCardRequest, JobStatus } from '@/types'
import { JOB_STATUSES } from '@/utils/constants'
import { formatDate } from '@/utils/formatting'
import { showToast } from '@/store/toastStore'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Table, Column } from '@/components/ui/Table'
import {
  ClipboardList,
  Plus,
  Search,
  LayoutGrid,
  List,
  Car,
  ArrowRight,
} from 'lucide-react'

const jobCardSchema = z.object({
  customerId: z.string().min(1, 'Please select a customer'),
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(3, 'Description is required'),
  vehicleRegistrationNumber: z.string().min(2, 'License plate is required'),
  vehicleMake: z.string().min(1, 'Make is required (e.g. Toyota)'),
  vehicleModel: z.string().min(1, 'Model is required (e.g. Corolla)'),
  vehicleYear: z.coerce
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
})

type JobCardFormValues = z.infer<typeof jobCardSchema>

export const JobCardsPage: React.FC = () => {
  const { workshopId } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch job cards
  const { data: jobCards = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['jobCards', workshopId],
    queryFn: () => jobCardsApi.getAll(workshopId!),
    enabled: !!workshopId,
  })

  // Fetch customers for selector
  const { data: customers = [] } = useQuery({
    queryKey: ['customers', workshopId],
    queryFn: () => customersApi.getAll(workshopId!),
    enabled: !!workshopId,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobCardFormValues>({
    resolver: zodResolver(jobCardSchema),
    defaultValues: {
      vehicleYear: new Date().getFullYear(),
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateJobCardRequest) => jobCardsApi.create(workshopId!, data),
    onSuccess: (newJob) => {
      queryClient.invalidateQueries({ queryKey: ['jobCards', workshopId] })
      showToast('Job Card created successfully', 'success')
      closeModal()
      navigate(`/jobs/${newJob.id}`)
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to create Job Card', 'error')
    },
  })

  const closeModal = () => {
    setIsModalOpen(false)
    reset()
  }

  const onSubmit = (values: JobCardFormValues) => {
    createMutation.mutate(values as any)
  }

  // Filter jobs
  const filteredJobs = jobCards.filter((j) => {
    const matchesSearch =
      j.vehicleRegistrationNumber.toLowerCase().includes(search.toLowerCase()) ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.vehicleMake.toLowerCase().includes(search.toLowerCase()) ||
      j.vehicleModel.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = selectedStatus === 'ALL' || j.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  // Customer map for rapid lookup
  const customerMap = React.useMemo(() => {
    const map = new Map<string, string>()
    customers.forEach((c) => map.set(c.id, `${c.firstName} ${c.lastName}`))
    return map
  }, [customers])

  // Kanban lanes definition
  const KANBAN_LANES: { title: string; status: JobStatus }[] = [
    { title: 'Received', status: 'Received' },
    { title: 'Diagnosing', status: 'Diagnosing' },
    { title: 'In Progress', status: 'InProgress' },
    { title: 'Quality Check', status: 'QualityCheck' },
    { title: 'Ready For Delivery', status: 'ReadyForDelivery' },
    { title: 'Completed', status: 'Completed' },
  ]

  const columns: Column<JobCardResponse>[] = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (j) => (
        <div>
          <span className="font-bold font-mono text-slate-900 text-base">
            {j.vehicleRegistrationNumber}
          </span>
          <span className="block text-xs font-normal text-slate-500">
            {j.vehicleMake} {j.vehicleModel} ({j.vehicleYear})
          </span>
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Job Title & Customer',
      render: (j) => (
        <div>
          <span className="font-medium text-slate-800">{j.title}</span>
          <span className="block text-xs text-brand-red font-medium">
            {customerMap.get(j.customerId) || 'Customer'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (j) => <StatusBadge status={j.status} type="job" />,
    },
    {
      key: 'createdAt',
      header: 'Logged Date',
      render: (j) => (
        <span className="text-xs text-slate-500">{formatDate(j.createdAt)}</span>
      ),
    },
    {
      key: 'action',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      render: (j) => (
        <Button
          size="sm"
          variant="secondary"
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          onClick={() => navigate(`/jobs/${j.id}`)}
        >
          View
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Title & Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 uppercase flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-brand-red" />
            Job Cards & Workflow
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track repair orders, diagnostic inspections, and delivery status
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            variant="primary"
            size="sm"
          >
            New Job Card
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="max-w-md w-full">
          <Input
            placeholder="Search vehicle license, model, title..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedStatus === 'ALL'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
          >
            All ({jobCards.length})
          </button>
          {JOB_STATUSES.slice(1, 7).map((status) => {
            const count = jobCards.filter((j) => j.status === status).length
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedStatus === status
                    ? 'bg-brand-red text-white shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                }`}
              >
                {status.replace(/([A-Z])/g, ' $1').trim()} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Content: Kanban vs Table */}
      {viewMode === 'table' ? (
        <Table
          columns={columns}
          data={filteredJobs}
          keyExtractor={(j) => j.id}
          isLoading={jobsLoading}
          emptyMessage="No job cards matching criteria"
          emptyActionLabel="Create First Job Card"
          onEmptyAction={() => setIsModalOpen(true)}
          onRowClick={(j) => navigate(`/jobs/${j.id}`)}
        />
      ) : (
        /* Kanban Board View - Mix of light columns with dark accent cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto min-h-[500px]">
          {KANBAN_LANES.map((lane) => {
            const laneJobs = filteredJobs.filter((j) => j.status === lane.status)
            const isDarkLane = lane.status === 'InProgress'

            return (
              <div
                key={lane.status}
                className={`border rounded-lg p-3 flex flex-col min-w-[240px] transition-colors ${
                  isDarkLane
                    ? 'bg-white border-slate-200 text-slate-800 shadow-sm'
                    : 'bg-slate-100/80 border-slate-200 text-slate-800'
                }`}
              >
                {/* Lane Header */}
                <div
                  className={`flex items-center justify-between pb-3 mb-3 border-b px-1 ${
                    isDarkLane ? 'border-slate-200' : 'border-slate-200'
                  }`}
                >
                  <span
                    className={`font-display text-xs font-bold uppercase tracking-wider ${
                      isDarkLane ? 'text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    {lane.title}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                      isDarkLane ? 'bg-slate-50 text-brand-red' : 'bg-white text-slate-600 shadow-2xs'
                    }`}
                  >
                    {laneJobs.length}
                  </span>
                </div>

                {/* Cards in Lane */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {laneJobs.map((job) => {
                    const isDarkCard = isDarkLane || job.status === 'Diagnosing'
                    return (
                      <div
                        key={job.id}
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className={`p-3.5 rounded-md border cursor-pointer transition-all duration-150 shadow-xs group ${
                          isDarkCard
                            ? 'bg-white border-slate-200 hover:border-brand-red/60 text-slate-900 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md text-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${
                              isDarkCard
                                ? 'bg-slate-100 text-slate-700 border-slate-200'
                                : 'bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                          >
                            {job.vehicleRegistrationNumber}
                          </span>
                          <span
                            className={`text-[10px] ${
                              isDarkCard ? 'text-slate-500' : 'text-slate-400'
                            }`}
                          >
                            {formatDate(job.createdAt)}
                          </span>
                        </div>

                        <h4
                          className={`text-sm font-semibold group-hover:text-brand-red transition-colors line-clamp-1 ${
                            isDarkCard ? 'text-slate-900' : 'text-slate-900'
                          }`}
                        >
                          {job.title}
                        </h4>

                        <p
                          className={`text-xs mt-1 ${
                            isDarkCard ? 'text-slate-500' : 'text-slate-500'
                          }`}
                        >
                          {job.vehicleMake} {job.vehicleModel} ({job.vehicleYear})
                        </p>

                        <div
                          className={`mt-3 pt-2 border-t flex items-center justify-between text-[11px] ${
                            isDarkCard
                              ? 'border-slate-200 text-slate-500'
                              : 'border-slate-100 text-slate-500'
                          }`}
                        >
                          <span className="truncate max-w-[120px]">
                            {customerMap.get(job.customerId) || 'Customer'}
                          </span>
                          <span className="font-semibold text-brand-red flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            Open &rarr;
                          </span>
                        </div>
                      </div>
                    )
                  })}

                  {laneJobs.length === 0 && (
                    <div
                      className={`h-28 flex items-center justify-center border border-dashed rounded-md text-[11px] ${
                        isDarkLane
                          ? 'border-slate-200 text-slate-500'
                          : 'border-slate-300 text-slate-400'
                      }`}
                    >
                      No jobs in this lane
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* New Job Card Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Open New Job Card" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Customer Selection */}
          <Select
            label="Customer"
            placeholder="Select a registered customer..."
            options={customers.map((c) => ({
              value: c.id,
              label: `${c.firstName} ${c.lastName} (${c.phone})`,
            }))}
            error={errors.customerId?.message}
            {...register('customerId')}
          />

          {/* Vehicle Information */}
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Car className="w-4 h-4" /> Vehicle Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="License Plate / Reg No."
                placeholder="e.g. WP-CAA-1234"
                error={errors.vehicleRegistrationNumber?.message}
                {...register('vehicleRegistrationNumber')}
              />
              <Input
                label="Manufacture Year"
                type="number"
                placeholder="2022"
                error={errors.vehicleYear?.message}
                {...register('vehicleYear')}
              />
              <Input
                label="Vehicle Make"
                placeholder="e.g. Toyota"
                error={errors.vehicleMake?.message}
                {...register('vehicleMake')}
              />
              <Input
                label="Vehicle Model"
                placeholder="e.g. Land Cruiser Prado"
                error={errors.vehicleModel?.message}
                {...register('vehicleModel')}
              />
            </div>
          </div>

          {/* Job Scope */}
          <div className="pt-2">
            <Input
              label="Job Card Title"
              placeholder="e.g. Major 50,000km Periodic Service & Brake Overhaul"
              error={errors.title?.message}
              {...register('title')}
            />
            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Issue Description / Customer Requests
              </label>
              <textarea
                className="w-full bg-white border border-slate-300 focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 text-slate-900 text-sm rounded-lg p-3 outline-none transition-colors"
                rows={3}
                placeholder="Customer reports squeaking noise on front brakes and routine oil service requested..."
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-brand-red font-medium mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
              Create Job Card
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}