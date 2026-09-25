import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Car, ClipboardList, Receipt, UserRound } from 'lucide-react'
import { customerPortalApi } from '@/api/customerPortal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Spinner } from '@/components/ui/Spinner'
import { formatDate } from '@/utils/formatting'

export const CustomerPortalPage: React.FC = () => {
  const profile = useQuery({ queryKey: ['customer-portal', 'profile'], queryFn: customerPortalApi.getProfile })
  const jobs = useQuery({ queryKey: ['customer-portal', 'jobs'], queryFn: customerPortalApi.getJobs })
  const invoices = useQuery({ queryKey: ['customer-portal', 'invoices'], queryFn: customerPortalApi.getInvoices })
  const payments = useQuery({ queryKey: ['customer-portal', 'payments'], queryFn: customerPortalApi.getPayments })
  const vehiclesQuery = useQuery({ queryKey: ['customer-portal', 'vehicles'], queryFn: customerPortalApi.getVehicles })

  if (profile.isLoading || jobs.isLoading || invoices.isLoading || payments.isLoading || vehiclesQuery.isLoading) {
    return <div className="flex justify-center p-16"><Spinner size="lg" /></div>
  }
  if (!profile.data) {
    return <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">Customer portal profile is not linked. Please contact your workshop.</div>
  }

  const vehicles = vehiclesQuery.data ?? []
  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{profile.data.workshopName}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Welcome, {profile.data.firstName}</h1>
        <p className="mt-1 text-sm text-slate-500">Your vehicles, service progress, invoices and payments.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Summary icon={<Car />} title="My vehicles" value={vehicles.length} />
        <Summary icon={<ClipboardList />} title="Job cards" value={(jobs.data ?? []).length} />
        <Summary icon={<Receipt />} title="Invoices" value={(invoices.data ?? []).length} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900"><Car className="h-4 w-4" /> My vehicles</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {vehicles.map((vehicle) => <article key={vehicle.registrationNumber} className="rounded-md border border-slate-200 p-4">
            <p className="font-semibold text-slate-900">{vehicle.make} {vehicle.model}</p>
            <p className="font-mono text-sm text-slate-600">{vehicle.registrationNumber}</p>
            <p className="mt-1 text-xs text-slate-500">{vehicle.year} · Last serviced {formatDate(vehicle.lastServicedAt)}</p>
          </article>)}
          {vehicles.length === 0 && <p className="text-sm text-slate-500">No vehicles linked yet.</p>}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900"><UserRound className="h-4 w-4" /> My profile</h2>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <p className="text-slate-600">Name <strong className="ml-2 text-slate-900">{profile.data.firstName} {profile.data.lastName}</strong></p>
          <p className="text-slate-600">Phone <strong className="ml-2 text-slate-900">{profile.data.phone}</strong></p>
          <p className="text-slate-600">Email <strong className="ml-2 text-slate-900">{profile.data.email}</strong></p>
          <p className="text-slate-600">Address <strong className="ml-2 text-slate-900">{profile.data.address || '—'}</strong></p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900"><ClipboardList className="h-4 w-4" /> My jobs</h2>
        <div className="space-y-3">
          {(jobs.data ?? []).map((job) => (
            <article key={job.id} className="rounded-md border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><h3 className="font-semibold text-slate-900">{job.title}</h3><p className="text-xs text-slate-500">{job.vehicleMake} {job.vehicleModel} · {job.vehicleRegistrationNumber}</p></div>
                <StatusBadge status={job.status} type="job" />
              </div>
              <p className="mt-2 text-sm text-slate-600">{job.description}</p>
              <p className="mt-1 text-xs text-slate-400">Opened {formatDate(job.createdAt)}</p>
              {job.tasks.length > 0 && <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                {job.tasks.map((task) => <li key={task.id} className="flex flex-wrap items-center justify-between gap-2 text-sm"><span className="text-slate-700">{task.title}</span><StatusBadge status={task.status} type="task" /></li>)}
              </ul>}
              {job.parts.length > 0 && <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Parts issued: </span>
                {job.parts.map((part) => `${part.name} × ${part.quantity}`).join(' · ')}
              </div>}
            </article>
          ))}
          {(jobs.data ?? []).length === 0 && <p className="text-sm text-slate-500">No job cards yet.</p>}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900"><Receipt className="h-4 w-4" /> Payment history</h2>
        <div className="space-y-2">
          {(payments.data ?? []).map((payment) => <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-2 text-sm last:border-0">
            <span className="text-slate-700">{payment.invoiceNumber} · {payment.method}</span>
            <span className="font-semibold text-slate-900">{payment.amount.toLocaleString()} <span className="font-normal text-slate-500">{formatDate(payment.paidAt)}</span></span>
          </div>)}
          {(payments.data ?? []).length === 0 && <p className="text-sm text-slate-500">No payments recorded yet.</p>}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900"><Receipt className="h-4 w-4" /> My invoices and payments</h2>
        <div className="space-y-3">
          {(invoices.data ?? []).map((invoice) => <article key={invoice.id} className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-slate-200 p-4">
            <div><p className="font-semibold text-slate-900">{invoice.invoiceNumber}</p><p className="text-xs text-slate-500">{formatDate(invoice.createdAt)} · {invoice.payments.length} payment(s)</p></div>
            <div className="flex items-center gap-4"><strong className="text-slate-900">{invoice.total.toLocaleString()}</strong><StatusBadge status={invoice.status} type="invoice" /></div>
          </article>)}
          {(invoices.data ?? []).length === 0 && <p className="text-sm text-slate-500">No invoices yet.</p>}
        </div>
      </section>
    </div>
  )
}

const Summary: React.FC<{ icon: React.ReactNode; title: string; value: number }> = ({ icon, title, value }) => (
  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-slate-600">
    <span className="text-brand-red [&>svg]:h-5 [&>svg]:w-5">{icon}</span><div><p className="text-xs">{title}</p><p className="text-xl font-bold text-slate-900">{value}</p></div>
  </div>
)
