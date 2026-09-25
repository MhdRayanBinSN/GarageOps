import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Play, CheckCircle2 } from 'lucide-react'
import { jobTasksApi } from '@/api/jobTasks'
import { inventoryApi } from '@/api/inventory'
import { partRequestsApi } from '@/api/partRequests'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { showToast } from '@/store/toastStore'
import { useAuthStore } from '@/store/authStore'
import type { TaskStatus } from '@/types'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

export const MyTasksPage: React.FC = () => {
  const { workshopId } = useAuthStore()
  const queryClient = useQueryClient()
  const [workData, setWorkData] = useState<Record<string, { workPerformed: string; actualHours: string }>>({})
  const [requestData, setRequestData] = useState<Record<string, { partId: string; quantity: string; notes: string; open: boolean }>>({})
  const { data: parts = [] } = useQuery({
    queryKey: ['inventoryAvailability', workshopId],
    queryFn: () => inventoryApi.getAvailability(workshopId!),
    enabled: !!workshopId,
  })
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['myTasks', workshopId],
    queryFn: jobTasksApi.getMine,
    enabled: !!workshopId,
  })

  const updateTask = useMutation({
    mutationFn: ({ jobCardId, taskId, status, actualHours, workPerformed }: { jobCardId: string; taskId: string; status: TaskStatus; actualHours?: number; workPerformed?: string }) =>
      jobTasksApi.updateStatus(workshopId!, jobCardId, taskId, { status, actualHours, workPerformed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTasks', workshopId] })
      showToast('Task status updated', 'success')
    },
    onError: () => showToast('Could not update this task', 'error'),
  })

  const createPartRequest = useMutation({
    mutationFn: ({ jobCardId, jobTaskId, partId, quantity, notes }: { jobCardId: string; jobTaskId: string; partId: string; quantity: number; notes: string }) =>
      partRequestsApi.create(jobCardId, { jobTaskId, partId, quantity, notes }),
    onSuccess: () => showToast('Part request sent to Store Staff', 'success'),
    onError: (error: any) => showToast(error.response?.data?.message || 'Could not request this part', 'error'),
  })

  if (isLoading) return <div className="flex justify-center p-12"><Spinner size="lg" /></div>

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-bold text-slate-900">My Tasks</h1>
        <p className="mt-1 text-sm text-slate-500">Only work assigned to your account appears here.</p>
      </header>

      {tasks.length === 0 ? (
        <EmptyState title="No tasks assigned yet" description="Your assigned workshop tasks will appear here." />
      ) : (
        <div className="grid gap-3">
          {tasks.map((task) => (
            <article key={task.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-semibold text-slate-900">{task.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{task.description}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <ClipboardList className="h-3.5 w-3.5" /> {task.jobTitle || `Job card ${task.jobCardId.slice(0, 8)}`}
                    {task.vehicleRegistrationNumber && <span>· {task.vehicleRegistrationNumber} {task.vehicleMake} {task.vehicleModel} {task.vehicleYear}</span>}
                    {task.estimatedHours != null && <span>· {task.estimatedHours} estimated hours</span>}
                  </p>
                  {task.workPerformed && <p className="mt-2 rounded-md bg-slate-50 p-2 text-xs text-slate-600">Work recorded: {task.workPerformed} ({task.actualHours} actual hours)</p>}
                  {task.status === 'InProgress' && <div className="mt-3 grid max-w-lg gap-2 sm:grid-cols-[1fr_9rem]">
                    <Input label="Work performed" value={workData[task.id]?.workPerformed ?? ''} onChange={(e) => setWorkData((prev) => ({ ...prev, [task.id]: { ...prev[task.id], workPerformed: e.target.value, actualHours: prev[task.id]?.actualHours ?? '' } }))} />
                    <Input label="Actual hours" type="number" min="0.1" step="0.1" value={workData[task.id]?.actualHours ?? ''} onChange={(e) => setWorkData((prev) => ({ ...prev, [task.id]: { ...prev[task.id], actualHours: e.target.value, workPerformed: prev[task.id]?.workPerformed ?? '' } }))} />
                  </div>}
                  {requestData[task.id]?.open && <div className="mt-3 grid max-w-2xl gap-2 sm:grid-cols-[minmax(12rem,1fr)_8rem_minmax(12rem,1fr)_auto] sm:items-end">
                    <Select label="Part" options={parts.filter((part) => part.isActive).map((part) => ({ value: part.id, label: `${part.name} · ${part.stockQuantity} in stock` }))} value={requestData[task.id]?.partId ?? ''} placeholder="Choose part" onChange={(e) => setRequestData((prev) => ({ ...prev, [task.id]: { ...prev[task.id], partId: e.target.value, quantity: prev[task.id]?.quantity ?? '1', notes: prev[task.id]?.notes ?? '', open: true } }))} />
                    <Input label="Quantity" type="number" min="1" step="1" value={requestData[task.id]?.quantity ?? '1'} onChange={(e) => setRequestData((prev) => ({ ...prev, [task.id]: { ...prev[task.id], quantity: e.target.value, partId: prev[task.id]?.partId ?? '', notes: prev[task.id]?.notes ?? '', open: true } }))} />
                    <Input label="Note (optional)" value={requestData[task.id]?.notes ?? ''} onChange={(e) => setRequestData((prev) => ({ ...prev, [task.id]: { ...prev[task.id], notes: e.target.value, partId: prev[task.id]?.partId ?? '', quantity: prev[task.id]?.quantity ?? '1', open: true } }))} />
                    <Button size="sm" disabled={!requestData[task.id]?.partId || Number(requestData[task.id]?.quantity) <= 0} isLoading={createPartRequest.isPending} onClick={() => createPartRequest.mutate({ jobCardId: task.jobCardId, jobTaskId: task.id, partId: requestData[task.id].partId, quantity: Number(requestData[task.id].quantity), notes: requestData[task.id].notes })}>Send Request</Button>
                  </div>}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={task.status} type="task" />
                  {task.status === 'Assigned' && <Button size="sm" onClick={() => updateTask.mutate({ jobCardId: task.jobCardId, taskId: task.id, status: 'InProgress' })} isLoading={updateTask.isPending} leftIcon={<Play className="h-3.5 w-3.5" />}>Start</Button>}
                  {task.status === 'InProgress' && <Button size="sm" disabled={!workData[task.id]?.workPerformed?.trim() || !(Number(workData[task.id]?.actualHours) > 0)} onClick={() => updateTask.mutate({ jobCardId: task.jobCardId, taskId: task.id, status: 'Completed', actualHours: Number(workData[task.id]?.actualHours), workPerformed: workData[task.id]?.workPerformed })} isLoading={updateTask.isPending} leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}>Complete</Button>}
                  {task.status !== 'Completed' && <Button size="sm" variant="secondary" onClick={() => setRequestData((prev) => ({ ...prev, [task.id]: { partId: prev[task.id]?.partId ?? '', quantity: prev[task.id]?.quantity ?? '1', notes: prev[task.id]?.notes ?? '', open: !prev[task.id]?.open } }))}>Request Part</Button>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
