import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { partsApi } from '@/api/parts'
import type { PartResponse, CreatePartRequest } from '@/types'
import { formatCurrency } from '@/utils/formatting'
import { showToast } from '@/store/toastStore'
import { Table, Column } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Package, Plus, Search, Edit2, Trash2, ArrowUpDown, AlertCircle } from 'lucide-react'

const partSchema = z.object({
  name: z.string().min(2, 'Part name is required'),
  partNumber: z.string().min(1, 'Part / OEM number is required'),
  unitPrice: z.coerce.number().min(0, 'Unit price must be positive'),
  stockQuantity: z.coerce.number().int().min(0, 'Quantity must be non-negative'),
})

type PartFormValues = z.infer<typeof partSchema>

export const PartsPage: React.FC = () => {
  const { workshopId } = useAuthStore()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [stockModalPart, setStockModalPart] = useState<PartResponse | null>(null)
  const [stockAdjustment, setStockAdjustment] = useState<number>(1)
  const [editingPart, setEditingPart] = useState<PartResponse | null>(null)
  const [deletingPartId, setDeletingPartId] = useState<string | null>(null)

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ['parts', workshopId],
    queryFn: () => partsApi.getAll(workshopId!),
    enabled: !!workshopId,
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PartFormValues>({
    resolver: zodResolver(partSchema),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreatePartRequest) => partsApi.create(workshopId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts', workshopId] })
      showToast('Part added to inventory', 'success')
      closeModal()
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to create part', 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: PartFormValues) =>
      partsApi.update(workshopId!, editingPart!.id, {
        name: data.name,
        unitPrice: data.unitPrice,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts', workshopId] })
      showToast('Part details updated', 'success')
      closeModal()
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to update part', 'error')
    },
  })

  const adjustStockMutation = useMutation({
    mutationFn: ({ partId, change }: { partId: string; change: number }) =>
      partsApi.adjustStock(workshopId!, partId, { quantityChange: change }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts', workshopId] })
      showToast('Stock quantity updated', 'success')
      setStockModalPart(null)
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to adjust stock', 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (partId: string) => partsApi.delete(workshopId!, partId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts', workshopId] })
      showToast('Part removed from inventory', 'success')
      setDeletingPartId(null)
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to delete part', 'error')
    },
  })

  const openCreateModal = () => {
    setEditingPart(null)
    reset({
      name: '',
      partNumber: '',
      unitPrice: 0,
      stockQuantity: 0,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (p: PartResponse) => {
    setEditingPart(p)
    setValue('name', p.name)
    setValue('partNumber', p.partNumber)
    setValue('unitPrice', p.unitPrice)
    setValue('stockQuantity', p.stockQuantity)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingPart(null)
    reset()
  }

  const onSubmit = (values: PartFormValues) => {
    if (editingPart) {
      updateMutation.mutate(values as any)
    } else {
      createMutation.mutate(values as any)
    }
  }

  const filteredParts = parts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.partNumber.toLowerCase().includes(search.toLowerCase())
  )

  const columns: Column<PartResponse>[] = [
    {
      key: 'name',
      header: 'Part Name & OEM',
      render: (p) => (
        <div>
          <span className="font-semibold text-slate-900">{p.name}</span>
          <span className="block text-xs font-mono text-slate-500">#{p.partNumber}</span>
        </div>
      ),
    },
    {
      key: 'unitPrice',
      header: 'Unit Price',
      render: (p) => (
        <span className="font-semibold text-slate-700 font-mono">
          {formatCurrency(p.unitPrice)}
        </span>
      ),
    },
    {
      key: 'stockQuantity',
      header: 'Stock Level',
      render: (p) => {
        const isLowStock = p.stockQuantity <= 5
        return (
          <div className="flex items-center gap-2">
            <span
              className={`font-bold font-mono text-sm px-2 py-0.5 rounded ${
                isLowStock
                  ? 'bg-rose-50 text-brand-red border border-rose-200 animate-pulse'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {p.stockQuantity}
            </span>
            {isLowStock && (
              <span className="text-[11px] text-brand-red font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Low Stock
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />}
            onClick={() => {
              setStockModalPart(p)
              setStockAdjustment(1)
            }}
          >
            Adjust Stock
          </Button>
          <button
            onClick={() => openEditModal(p)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Edit Details"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingPartId(p.id)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-red hover:bg-rose-50 transition-colors"
            title="Delete Part"
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
            <Package className="w-6 h-6 text-brand-red" />
            Inventory & Parts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track spare parts stock levels, unit pricing, and OEM catalog
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
          variant="primary"
          size="sm"
        >
          Add Part
        </Button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <Input
          placeholder="Search by part name or number..."
          leftIcon={<Search className="w-4 h-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Parts Table */}
      <Table
        columns={columns}
        data={filteredParts}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        emptyMessage="No spare parts in inventory"
        emptyActionLabel="Add First Part"
        onEmptyAction={openCreateModal}
      />

      {/* Add / Edit Part Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingPart ? 'Edit Part Details' : 'Add New Inventory Part'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Part Name"
            placeholder="e.g. Brake Pads Front Set"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Part / OEM Number"
            placeholder="e.g. BP-48291-OEM"
            disabled={!!editingPart}
            error={errors.partNumber?.message}
            {...register('partNumber')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Unit Price ($ / LKR)"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.unitPrice?.message}
              {...register('unitPrice')}
            />

            {!editingPart && (
              <Input
                label="Initial Quantity"
                type="number"
                placeholder="10"
                error={errors.stockQuantity?.message}
                {...register('stockQuantity')}
              />
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingPart ? 'Update Part' : 'Create Part'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Quick Adjust Stock Modal */}
      <Modal
        isOpen={!!stockModalPart}
        onClose={() => setStockModalPart(null)}
        title={`Adjust Stock: ${stockModalPart?.name}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Current Stock:{' '}
            <strong className="text-slate-900 font-mono text-sm">
              {stockModalPart?.stockQuantity}
            </strong>
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Quantity Change (+ to add, - to deduct)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStockAdjustment((prev) => prev - 1)}
                className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-lg flex items-center justify-center border border-slate-300"
              >
                -
              </button>
              <input
                type="number"
                value={stockAdjustment}
                onChange={(e) => setStockAdjustment(parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded-lg py-2 text-center text-slate-900 font-mono font-bold text-lg"
              />
              <button
                type="button"
                onClick={() => setStockAdjustment((prev) => prev + 1)}
                className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-lg flex items-center justify-center border border-slate-300"
              >
                +
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              New quantity will be:{' '}
              <strong className="text-slate-500 font-mono">
                {Math.max(0, (stockModalPart?.stockQuantity ?? 0) + stockAdjustment)}
              </strong>
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setStockModalPart(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={adjustStockMutation.isPending}
              onClick={() => {
                if (stockModalPart) {
                  adjustStockMutation.mutate({
                    partId: stockModalPart.id,
                    change: stockAdjustment,
                  })
                }
              }}
            >
              Apply Adjustment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingPartId}
        onClose={() => setDeletingPartId(null)}
        onConfirm={() => deletingPartId && deleteMutation.mutate(deletingPartId)}
        isLoading={deleteMutation.isPending}
        title="Remove Part"
        message="Are you sure you want to delete this part from inventory?"
        confirmText="Remove"
      />
    </div>
  )
}
