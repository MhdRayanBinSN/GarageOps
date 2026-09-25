import React, { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { workshopsApi, type UpdateWorkshopRequest } from '@/api/workshops'
import { useAuthStore } from '@/store/authStore'
import { showToast } from '@/store/toastStore'

export const WorkshopSettingsPage: React.FC = () => {
  const { workshopId } = useAuthStore()
  const queryClient = useQueryClient()
  const { data: workshop, isLoading } = useQuery({
    queryKey: ['workshop', workshopId],
    queryFn: () => workshopsApi.get(workshopId!),
    enabled: !!workshopId,
  })
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<UpdateWorkshopRequest>()

  useEffect(() => {
    if (workshop) reset({ name: workshop.name, phone: workshop.phone, email: workshop.email, address: workshop.address })
  }, [workshop, reset])

  const update = useMutation({
    mutationFn: (values: UpdateWorkshopRequest) => workshopsApi.update(workshopId!, values),
    onSuccess: (data) => {
      queryClient.setQueryData(['workshop', workshopId], data)
      reset({ name: data.name, phone: data.phone, email: data.email, address: data.address })
      showToast('Workshop settings saved', 'success')
    },
    onError: () => showToast('Could not save workshop settings', 'error'),
  })

  if (isLoading) return <div className="flex justify-center p-12"><Spinner size="lg" /></div>

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-slate-900"><Building2 className="h-5 w-5 text-brand-red" /> Workshop Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Update the contact and address information for your workshop.</p>
      </header>
      <form onSubmit={handleSubmit((values) => update.mutate(values))} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
        <Input label="Workshop Name" required {...register('name', { required: true })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Phone" required {...register('phone', { required: true })} />
          <Input label="Email" type="email" required {...register('email', { required: true })} />
        </div>
        <Input label="Address" required {...register('address', { required: true })} />
        <div className="flex justify-end border-t border-slate-200 pt-4">
          <Button type="submit" isLoading={update.isPending} disabled={!isDirty}>Save Settings</Button>
        </div>
      </form>
    </div>
  )
}
