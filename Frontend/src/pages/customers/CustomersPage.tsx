import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { customersApi } from '@/api/customers'
import type { CustomerResponse, CreateCustomerRequest } from '@/types'
import { showToast } from '@/store/toastStore'
import { Table, Column } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Users, Plus, Search, Edit2, Trash2, Phone, Mail, MapPin, UserRoundPlus } from 'lucide-react'

const customerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(4, 'Valid phone number is required'),
  email: z.string().email('Valid email address is required'),
  address: z.string().min(2, 'Address is required'),
})

type CustomerFormValues = z.infer<typeof customerSchema>

export const CustomersPage: React.FC = () => {
  const { workshopId } = useAuthStore()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<CustomerResponse | null>(null)
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null)
  const [portalCustomer, setPortalCustomer] = useState<CustomerResponse | null>(null)
  const [portalUsername, setPortalUsername] = useState('')
  const [portalPassword, setPortalPassword] = useState('')

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', workshopId],
    queryFn: () => customersApi.getAll(workshopId!),
    enabled: !!workshopId,
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateCustomerRequest) => customersApi.create(workshopId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', workshopId] })
      showToast('Customer created successfully', 'success')
      closeModal()
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to create customer', 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: CustomerFormValues) =>
      customersApi.update(workshopId!, editingCustomer!.id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', workshopId] })
      showToast('Customer updated successfully', 'success')
      closeModal()
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to update customer', 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (customerId: string) => customersApi.delete(workshopId!, customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', workshopId] })
      showToast('Customer removed', 'success')
      setDeletingCustomerId(null)
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to delete customer', 'error')
    },
  })

  const portalMutation = useMutation({
    mutationFn: () => customersApi.createPortalAccess(workshopId!, portalCustomer!.id, { username: portalUsername, password: portalPassword }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', workshopId] })
      showToast('Customer portal access created', 'success')
      setPortalCustomer(null)
      setPortalPassword('')
    },
    onError: (err: any) => showToast(err.response?.data?.message || 'Could not create portal access', 'error'),
  })

  const openCreateModal = () => {
    setEditingCustomer(null)
    reset({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (c: CustomerResponse) => {
    setEditingCustomer(c)
    setValue('firstName', c.firstName)
    setValue('lastName', c.lastName)
    setValue('phone', c.phone)
    setValue('email', c.email)
    setValue('address', c.address)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCustomer(null)
    reset()
  }

  const onSubmit = (values: CustomerFormValues) => {
    if (editingCustomer) {
      updateMutation.mutate(values)
    } else {
      createMutation.mutate(values as any)
    }
  }

  const filteredCustomers = customers.filter(
    (c) =>
      c.firstName.toLowerCase().includes(search.toLowerCase()) ||
      c.lastName.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  )

  const columns: Column<CustomerResponse>[] = [
    {
      key: 'name',
      header: 'Customer',
      render: (c) => (
        <div>
          <span className="font-semibold text-slate-900">
            {c.firstName} {c.lastName}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <Mail className="w-3 h-3 text-slate-400" />
            <span>{c.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone Number',
      render: (c) => (
        <div className="flex items-center gap-1.5 text-slate-700">
          <Phone className="w-3.5 h-3.5 text-brand-red" />
          <span>{c.phone}</span>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Address',
      render: (c) => (
        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate max-w-[200px]">{c.address}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
            c.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {c.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      render: (c) => (
        <div className="flex items-center justify-end gap-2">
          {!c.hasPortalAccess && <button
            onClick={() => { setPortalCustomer(c); setPortalUsername(c.email); setPortalPassword('') }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-red hover:bg-rose-50 transition-colors"
            title="Create customer portal access"
          ><UserRoundPlus className="w-4 h-4" /></button>}
          <button
            onClick={() => openEditModal(c)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Edit Customer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingCustomerId(c.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-red hover:bg-rose-50 transition-colors"
            title="Delete Customer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 uppercase flex items-center gap-2.5">
            <Users className="w-6 h-6 text-brand-red" />
            Customer Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage client profiles, contact information, and billing records
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
          variant="primary"
          size="sm"
        >
          Add Customer
        </Button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <Input
          placeholder="Search by name, phone, or email..."
          leftIcon={<Search className="w-4 h-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Customers Table */}
      <Table
        columns={columns}
        data={filteredCustomers}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        emptyMessage="No customers found"
        emptyActionLabel="Add your first customer"
        onEmptyAction={openCreateModal}
      />

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="e.g. John"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label="Last Name"
              placeholder="e.g. Doe"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <Input
            label="Phone Number"
            placeholder="e.g. 0771234567"
            leftIcon={<Phone className="w-4 h-4" />}
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Physical Address"
            placeholder="e.g. 42 Flower Road, Colombo"
            leftIcon={<MapPin className="w-4 h-4" />}
            error={errors.address?.message}
            {...register('address')}
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
              {editingCustomer ? 'Update Customer' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!portalCustomer} onClose={() => setPortalCustomer(null)} title="Create customer portal access" size="sm">
        <form onSubmit={(event) => { event.preventDefault(); portalMutation.mutate() }} className="space-y-4">
          <p className="text-sm text-slate-600">Create sign-in access for {portalCustomer?.firstName} {portalCustomer?.lastName}. They will only see their own workshop records.</p>
          <Input label="Username" value={portalUsername} onChange={(event) => setPortalUsername(event.target.value)} required minLength={3} />
          <Input label="Temporary password" type="password" value={portalPassword} onChange={(event) => setPortalPassword(event.target.value)} required minLength={8} />
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button type="button" variant="secondary" onClick={() => setPortalCustomer(null)}>Cancel</Button>
            <Button type="submit" isLoading={portalMutation.isPending}>Create access</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingCustomerId}
        onClose={() => setDeletingCustomerId(null)}
        onConfirm={() => deletingCustomerId && deleteMutation.mutate(deletingCustomerId)}
        isLoading={deleteMutation.isPending}
        title="Remove Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        confirmText="Delete Customer"
      />
    </div>
  )
}
