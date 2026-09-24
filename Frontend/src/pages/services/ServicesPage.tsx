import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { servicesApi } from '@/api/services'
import type { ServiceResponse, CreateServiceRequest } from '@/types'
import { formatCurrency } from '@/utils/formatting'
import { showToast } from '@/store/toastStore'
import { Table, Column } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Wrench, Plus, Search, Edit2, Trash2 } from 'lucide-react'

const serviceSchema = z.object({
  name: z.string().min(2, 'Service name is required'),
  description: z.string().min(3, 'Description is required'),
  defaultPrice: z.coerce.number().min(0, 'Price must be a positive number'),
})

type ServiceFormValues = z.infer<typeof serviceSchema>

export const ServicesPage: React.FC = () => {
  const { workshopId } = useAuthStore()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceResponse | null>(null)
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null)

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services', workshopId],
    queryFn: () => servicesApi.getAll(workshopId!),
    enabled: !!workshopId,
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateServiceRequest) => servicesApi.create(workshopId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', workshopId] })
      showToast('Service added to catalog', 'success')
      closeModal()
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to add service', 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: ServiceFormValues) =>
      servicesApi.update(workshopId!, editingService!.id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', workshopId] })
      showToast('Service updated', 'success')
      closeModal()
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to update service', 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (serviceId: string) => servicesApi.delete(workshopId!, serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', workshopId] })
      showToast('Service removed', 'success')
      setDeletingServiceId(null)
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to delete service', 'error')
    },
  })

  const openCreateModal = () => {
    setEditingService(null)
    reset({
      name: '',
      description: '',
      defaultPrice: 0,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (s: ServiceResponse) => {
    setEditingService(s)
    setValue('name', s.name)
    setValue('description', s.description)
    setValue('defaultPrice', s.defaultPrice)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingService(null)
    reset()
  }

  const onSubmit = (values: ServiceFormValues) => {
    if (editingService) {
      updateMutation.mutate(values)
    } else {
      createMutation.mutate(values as any)
    }
  }

  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  )

  const columns: Column<ServiceResponse>[] = [
    {
      key: 'name',
      header: 'Service',
      render: (s) => (
        <div>
          <span className="font-semibold text-slate-900">{s.name}</span>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{s.description}</p>
        </div>
      ),
    },
    {
      key: 'defaultPrice',
      header: 'Standard Rate',
      render: (s) => (
        <span className="font-semibold text-slate-500 font-mono">
          {formatCurrency(s.defaultPrice)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
            s.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {s.isActive ? 'Available' : 'Archived'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      render: (s) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openEditModal(s)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Edit Service"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingServiceId(s.id)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-red hover:bg-rose-50 transition-colors"
            title="Delete Service"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black tracking-wide text-slate-900 uppercase flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-brand-red" />
            Services Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Standard workshop offerings, diagnostic labor, and repairs
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
          variant="primary"
          size="sm"
        >
          Add Service
        </Button>
      </div>

      {/* Search Filter */}
      <div className="max-w-md">
        <Input
          placeholder="Search services or packages..."
          leftIcon={<Search className="w-4 h-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Services Table */}
      <Table
        columns={columns}
        data={filteredServices}
        keyExtractor={(s) => s.id}
        isLoading={isLoading}
        emptyMessage="No services registered in catalog"
        emptyActionLabel="Add First Service"
        onEmptyAction={openCreateModal}
      />

      {/* Add / Edit Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingService ? 'Edit Service' : 'Add New Service'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Service Name"
            placeholder="e.g. Full Synthetic Oil & Filter Change"
            error={errors.name?.message}
            {...register('name')}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              className="w-full bg-slate-50 border border-slate-300 focus:border-sand focus:ring-1 focus:ring-sand/40 text-slate-900 text-sm rounded-lg p-3 outline-none transition-colors"
              rows={3}
              placeholder="Describe scope of work included in this service..."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-brand-red font-medium mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <Input
            label="Default Price ($ / LKR)"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.defaultPrice?.message}
            {...register('defaultPrice')}
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingService ? 'Update Service' : 'Create Service'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingServiceId}
        onClose={() => setDeletingServiceId(null)}
        onConfirm={() => deletingServiceId && deleteMutation.mutate(deletingServiceId)}
        isLoading={deleteMutation.isPending}
        title="Remove Service"
        message="Are you sure you want to remove this service from the catalog?"
        confirmText="Remove"
      />
    </div>
  )
}
