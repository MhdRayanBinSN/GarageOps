import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, PackageCheck, X } from 'lucide-react'
import { partRequestsApi } from '@/api/partRequests'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { showToast } from '@/store/toastStore'
import { useAuthStore } from '@/store/authStore'
import type { PartRequestStatus } from '@/types'

export const PartRequestsPage: React.FC = () => {
  const { workshopId } = useAuthStore()
  const queryClient = useQueryClient()
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['partRequests', workshopId],
    queryFn: () => partRequestsApi.getForWorkshop(workshopId!),
    enabled: !!workshopId,
  })
  const processRequest = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PartRequestStatus }) => partRequestsApi.process(workshopId!, id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partRequests', workshopId] })
      queryClient.invalidateQueries({ queryKey: ['parts', workshopId] })
      queryClient.invalidateQueries({ queryKey: ['inventoryAvailability', workshopId] })
      showToast('Part request updated', 'success')
    },
    onError: (error: any) => showToast(error.response?.data?.message || 'Could not process request', 'error'),
  })

  if (isLoading) return <div className="flex justify-center p-12"><Spinner size="lg" /></div>
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-bold text-slate-900">Job Part Requests</h1>
        <p className="mt-1 text-sm text-slate-500">Approve or reject requests, then issue approved parts to deduct them from stock.</p>
      </header>
      {requests.length === 0 ? <EmptyState title="No part requests yet" description="Requests from mechanics will appear here." /> : (
        <div className="grid gap-3">
          {requests.map((request) => (
            <article key={request.id} className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-slate-900">{request.partName}</h2>
                  <StatusBadge status={request.status} />
                </div>
                <p className="mt-1 text-sm text-slate-700">{request.quantity} × {request.partNumber} · requested by {request.requestedByName}</p>
                <p className="mt-1 text-xs text-slate-500">{request.jobTitle} · {request.vehicleRegistrationNumber} · {request.taskTitle}</p>
                {request.notes && <p className="mt-2 text-sm text-slate-600">{request.notes}</p>}
              </div>
              <div className="flex gap-2">
                {request.status === 'Pending' && <>
                  <Button size="sm" onClick={() => processRequest.mutate({ id: request.id, status: 'Approved' })} isLoading={processRequest.isPending} leftIcon={<Check className="h-4 w-4" />}>Approve</Button>
                  <Button size="sm" variant="secondary" onClick={() => processRequest.mutate({ id: request.id, status: 'Rejected' })} isLoading={processRequest.isPending} leftIcon={<X className="h-4 w-4" />}>Reject</Button>
                </>}
                {request.status === 'Approved' && <>
                  <Button size="sm" onClick={() => processRequest.mutate({ id: request.id, status: 'Issued' })} isLoading={processRequest.isPending} leftIcon={<PackageCheck className="h-4 w-4" />}>Issue Parts</Button>
                  <Button size="sm" variant="secondary" onClick={() => processRequest.mutate({ id: request.id, status: 'Rejected' })} isLoading={processRequest.isPending} leftIcon={<X className="h-4 w-4" />}>Reject</Button>
                </>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
