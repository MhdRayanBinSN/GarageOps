import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { employeesApi } from '@/api/employees'
import type { EmployeeResponse, CreateEmployeeRequest, EmployeeRole } from '@/types'
import { EMPLOYEE_ROLES } from '@/utils/constants'
import { showToast } from '@/store/toastStore'
import { Table, Column } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { UserCog, Plus, Shield, User, Lock, Mail, Trash2 } from 'lucide-react'

const employeeSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Valid email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  employeeRole: z.enum(['Owner', 'Manager', 'ServiceAdvisor', 'Mechanic', 'Technician']),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

export const EmployeesPage: React.FC = () => {
  const { workshopId } = useAuthStore()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deactivatingEmployeeId, setDeactivatingEmployeeId] = useState<string | null>(null)
  const [roleModalEmployee, setRoleModalEmployee] = useState<EmployeeResponse | null>(null)
  const [selectedRole, setSelectedRole] = useState<EmployeeRole>('Mechanic')

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees', workshopId],
    queryFn: () => employeesApi.getAll(workshopId!),
    enabled: !!workshopId,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employeeRole: 'Mechanic',
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateEmployeeRequest) => employeesApi.create(workshopId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', workshopId] })
      showToast('Team member added successfully', 'success')
      closeModal()
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to add employee', 'error')
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ empId, role }: { empId: string; role: EmployeeRole }) =>
      employeesApi.updateRole(workshopId!, empId, { employeeRole: role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', workshopId] })
      showToast('Employee role updated', 'success')
      setRoleModalEmployee(null)
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to update role', 'error')
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: (empId: string) => employeesApi.deactivate(workshopId!, empId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', workshopId] })
      showToast('Employee deactivated', 'success')
      setDeactivatingEmployeeId(null)
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to deactivate employee', 'error')
    },
  })

  const closeModal = () => {
    setIsModalOpen(false)
    reset()
  }

  const onSubmit = (values: EmployeeFormValues) => {
    createMutation.mutate(values as any)
  }

  const roleOptions = EMPLOYEE_ROLES.map((r) => ({
    value: r,
    label: r.replace(/([A-Z])/g, ' $1').trim(),
  }))

  const columns: Column<EmployeeResponse>[] = [
    {
      key: 'username',
      header: 'Staff Member',
      render: (e) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-500 text-xs">
            {e.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-slate-900">{e.username}</span>
            <div className="text-xs text-slate-500">{e.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'employeeRole',
      header: 'Role',
      render: (e) => {
        const roleColors: Record<string, string> = {
          Owner: 'bg-brand-red/20 text-brand-red border border-brand-red/30',
          Manager: 'bg-amber-50 text-amber-700 border border-amber-200',
          ServiceAdvisor: 'bg-blue-50 text-blue-700 border border-blue-200',
          Mechanic: 'bg-purple-50 text-purple-700 border border-purple-200',
          Technician: 'bg-teal-50 text-teal-700 border border-teal-200',
        }
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              roleColors[e.employeeRole] || 'bg-slate-100 text-slate-700'
            }`}
          >
            {e.employeeRole.replace(/([A-Z])/g, ' $1').trim()}
          </span>
        )
      },
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (e) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
            e.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {e.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      render: (e) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setRoleModalEmployee(e)
              setSelectedRole(e.employeeRole)
            }}
          >
            Edit Role
          </Button>
          {e.isActive && (
            <button
              onClick={() => setDeactivatingEmployeeId(e.id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-brand-red hover:bg-rose-50 transition-colors"
              title="Deactivate Employee"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
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
            <UserCog className="w-6 h-6 text-brand-red" />
            Workshop Team & Roles
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage mechanics, technicians, service advisors, and role permissions
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          variant="primary"
          size="sm"
        >
          Add Team Member
        </Button>
      </div>

      {/* Employees Table */}
      <Table
        columns={columns}
        data={employees}
        keyExtractor={(e) => e.id}
        isLoading={isLoading}
        emptyMessage="No employees registered yet"
        emptyActionLabel="Add First Team Member"
        onEmptyAction={() => setIsModalOpen(true)}
      />

      {/* Add Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Add Workshop Employee"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Username"
            placeholder="e.g. mike_mechanic"
            leftIcon={<User className="w-4 h-4" />}
            error={errors.username?.message}
            {...register('username')}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="mike@workshop.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Initial Password"
            type="password"
            placeholder="••••••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Select
            label="Assigned Role"
            options={roleOptions}
            error={errors.employeeRole?.message}
            {...register('employeeRole')}
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
              Create Employee
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={!!roleModalEmployee}
        onClose={() => setRoleModalEmployee(null)}
        title={`Change Role: ${roleModalEmployee?.username}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Select a new role assignment for this staff member:
          </p>
          <Select
            label="Select Role"
            options={roleOptions}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as EmployeeRole)}
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setRoleModalEmployee(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={updateRoleMutation.isPending}
              onClick={() => {
                if (roleModalEmployee) {
                  updateRoleMutation.mutate({
                    empId: roleModalEmployee.id,
                    role: selectedRole,
                  })
                }
              }}
            >
              Save Role
            </Button>
          </div>
        </div>
      </Modal>

      {/* Deactivate Dialog */}
      <ConfirmDialog
        isOpen={!!deactivatingEmployeeId}
        onClose={() => setDeactivatingEmployeeId(null)}
        onConfirm={() =>
          deactivatingEmployeeId && deactivateMutation.mutate(deactivatingEmployeeId)
        }
        isLoading={deactivateMutation.isPending}
        title="Deactivate Staff Member"
        message="Are you sure you want to deactivate this employee? They will lose access to the workshop portal immediately."
        confirmText="Deactivate"
      />
    </div>
  )
}
