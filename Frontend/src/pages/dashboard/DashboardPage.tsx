import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueries, useQuery } from '@tanstack/react-query'
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, BriefcaseBusiness,
  Building2, CheckCircle2, ChevronRight, CircleDollarSign, Clock3, Cog, Package,
  Plus, Settings2, Users2, Wrench, UserPlus, ClipboardCheck, Boxes, AlertCircle,
  FileText, UserRoundCheck,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { jobCardsApi } from '@/api/jobCards'
import { partsApi } from '@/api/parts'
import { customersApi } from '@/api/customers'
import { invoicesApi } from '@/api/invoices'
import { employeesApi } from '@/api/employees'
import { inventoryApi } from '@/api/inventory'
import { jobTasksApi } from '@/api/jobTasks'
import { partRequestsApi } from '@/api/partRequests'
import { formatCurrency, formatDate } from '@/utils/formatting'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import type { EmployeeResponse, JobCardResponse, JobTaskResponse } from '@/types'
import { useAuthStore as useRoleStore } from '@/store/authStore'

const activeJob = (job: JobCardResponse) => !['Completed', 'Cancelled'].includes(job.status)

const sectionCard = 'rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm'

export const DashboardPage: React.FC = () => {
  const { userType, employeeRole } = useRoleStore()
  const isFrontDesk = userType === 'WorkshopEmployee' && (employeeRole === 'FrontDesk' || employeeRole === 'Manager')
  return isFrontDesk ? <FrontDeskDashboard /> : <AdminDashboard />
}

const AdminDashboard: React.FC = () => {
  const { workshopId } = useAuthStore()
  const navigate = useNavigate()
  const [jobView, setJobView] = useState<'ongoing' | 'completed'>('ongoing')

  const queryOptions = { enabled: !!workshopId }
  const { data: jobs = [], isLoading: jobsLoading } = useQuery({ queryKey: ['jobCards', workshopId], queryFn: () => jobCardsApi.getAll(workshopId!), ...queryOptions })
  const { data: parts = [], isLoading: partsLoading } = useQuery({ queryKey: ['parts', workshopId], queryFn: () => partsApi.getAll(workshopId!), ...queryOptions })
  const { data: customers = [], isLoading: customersLoading } = useQuery({ queryKey: ['customers', workshopId], queryFn: () => customersApi.getAll(workshopId!), ...queryOptions })
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({ queryKey: ['invoices', workshopId], queryFn: () => invoicesApi.getAll(workshopId!), ...queryOptions })
  const { data: employees = [], isLoading: employeesLoading } = useQuery({ queryKey: ['employees', workshopId], queryFn: () => employeesApi.getAll(workshopId!), ...queryOptions })

  const isLoading = jobsLoading || partsLoading || customersLoading || invoicesLoading || employeesLoading
  const ongoing = useMemo(() => jobs.filter(activeJob).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), [jobs])
  const completed = useMemo(() => jobs.filter((job) => job.status === 'Completed').sort((a, b) => +new Date(b.updatedAt || b.createdAt) - +new Date(a.updatedAt || a.createdAt)), [jobs])
  const lowStock = parts.filter((part) => part.isActive && part.stockQuantity <= 5)
  const collected = invoices.filter((invoice) => invoice.status === 'Paid').reduce((sum, invoice) => sum + invoice.total, 0)
  const pending = invoices.filter((invoice) => invoice.status === 'Finalized').reduce((sum, invoice) => sum + invoice.total, 0)
  const displayedJobs = jobView === 'ongoing' ? ongoing : completed

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
            <Building2 className="h-3.5 w-3.5" /> Workshop control center
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Good work starts with a clear view.</h1>
          <p className="mt-1 text-sm text-slate-500">Today’s operations, team and business performance in one place.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" leftIcon={<Users2 className="h-4 w-4" />} onClick={() => navigate('/customers')}>Add customer</Button>
          <Button size="sm" variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/jobs')}>New job</Button>
        </div>
      </header>

      <section aria-label="Business overview" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Collected revenue" value={formatCurrency(collected)} note={`${formatCurrency(pending)} invoiced and awaiting payment`} icon={<CircleDollarSign />} accent="emerald" loading={isLoading} />
        <MetricCard label="Ongoing jobs" value={String(ongoing.length)} note={`${completed.length} completed jobs in history`} icon={<BriefcaseBusiness />} accent="rose" loading={isLoading} />
        <MetricCard label="Workshop team" value={String(employees.filter((employee) => employee.isActive).length)} note={`${employees.length} accounts across the workshop`} icon={<Users2 />} accent="blue" loading={isLoading} />
        <MetricCard label="Parts to review" value={String(lowStock.length)} note={`${parts.length} parts in the catalog`} icon={<Package />} accent={lowStock.length ? 'amber' : 'slate'} loading={isLoading} />
      </section>

      <section id="operations" className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,.8fr)]">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Workshop jobs</h2>
              <p className="mt-0.5 text-xs text-slate-500">Follow work in progress and revisit completed repairs.</p>
            </div>
            <div className="flex w-fit rounded-md border border-slate-200 p-0.5">
              <JobViewButton active={jobView === 'ongoing'} onClick={() => setJobView('ongoing')} label="Ongoing" count={ongoing.length} />
              <JobViewButton active={jobView === 'completed'} onClick={() => setJobView('completed')} label="History" count={completed.length} />
            </div>
          </div>
          {displayedJobs.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center px-4 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-400"><BriefcaseBusiness className="h-5 w-5" /></div>
              <p className="text-sm font-medium text-slate-700">{jobView === 'ongoing' ? 'No active jobs right now' : 'No completed jobs yet'}</p>
              <p className="mt-1 text-xs text-slate-500">Job cards and their repair history will show here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {displayedJobs.slice(0, 6).map((job) => (
                <button key={job.id} onClick={() => navigate(`/jobs/${job.id}`)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50 sm:gap-4">
                  <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 sm:flex"><Wrench className="h-4 w-4" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-mono text-xs font-semibold tracking-wide text-slate-900">{job.vehicleRegistrationNumber}</span>
                      <span className="truncate text-xs text-slate-500">{job.vehicleMake} {job.vehicleModel} · {job.vehicleYear}</span>
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-slate-700">{job.title}</p>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block"><StatusBadge status={job.status} type="job" /><p className="mt-1 text-[11px] text-slate-400">{formatDate(job.updatedAt || job.createdAt)}</p></div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                </button>
              ))}
            </div>
          )}
          <div className="border-t border-slate-100 px-4 py-3"><Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-rose-700">Open job board <ArrowRight className="h-3.5 w-3.5" /></Link></div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between">
            <div><h2 className="text-sm font-semibold text-slate-900">Business snapshot</h2><p className="mt-0.5 text-xs text-slate-500">A quick read on the workshop.</p></div>
            <BarChart3 className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-5 space-y-4">
            <SnapshotRow label="Jobs completed" value={String(completed.length)} detail={`${jobs.length} total job cards`} icon={<CheckCircle2 />} tone="emerald" />
            <SnapshotRow label="Open invoices" value={String(invoices.filter((invoice) => invoice.status === 'Finalized').length)} detail={formatCurrency(pending)} icon={<Clock3 />} tone="amber" />
            <SnapshotRow label="Customers" value={String(customers.length)} detail="Customer records" icon={<Users2 />} tone="blue" />
            <SnapshotRow label="Inventory alerts" value={String(lowStock.length)} detail="At or below 5 units" icon={<Activity />} tone={lowStock.length ? 'rose' : 'slate'} />
          </div>
          <div className="mt-5 rounded-md border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-600">
            Review low stock parts before assigning new work that depends on them.
            <Link to="/parts" className="ml-1 font-semibold text-slate-800 hover:text-rose-700">View inventory <ArrowRight className="inline h-3 w-3" /></Link>
          </div>
        </div>
      </section>

      <section id="management" className="space-y-3">
        <div><h2 className="text-sm font-semibold text-slate-900">Workshop management</h2><p className="mt-0.5 text-xs text-slate-500">Quick access to the tools you use to run your workshop.</p></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ManagementLink to="/employees" title="People & access" description="Create accounts, assign roles and manage your team." icon={<Users2 />} meta={`${employees.filter((e) => e.isActive).length} active`} />
          <ManagementLink to="/parts" title="Inventory" description="Parts catalog, stock levels and adjustments." icon={<Package />} meta={`${lowStock.length} stock alerts`} />
          <ManagementLink to="/services" title="Services catalog" description="Set up workshop services and standard pricing." icon={<Wrench />} meta="Labor & pricing" />
          <ManagementLink to="/settings" title="Workshop settings" description="Workshop details, account and configuration." icon={<Settings2 />} meta="Configuration" />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <QuickLink to="/invoices" icon={<CircleDollarSign />} title="Billing & payments" detail="Invoices, collections and balances" />
        <QuickLink to="/customers" icon={<Users2 />} title="Customer directory" detail={`${customers.length} customer records`} />
        <QuickLink to="/jobs" icon={<Cog />} title="Operations board" detail="All repair jobs and current status" />
      </section>
    </div>
  )
}

const FrontDeskDashboard: React.FC = () => {
  const { workshopId } = useAuthStore()
  const navigate = useNavigate()
  const queryOptions = { enabled: !!workshopId }
  const { data: jobs = [], isLoading: jobsLoading } = useQuery({ queryKey: ['jobCards', workshopId], queryFn: () => jobCardsApi.getAll(workshopId!), ...queryOptions })
  const { data: customers = [], isLoading: customersLoading } = useQuery({ queryKey: ['customers', workshopId], queryFn: () => customersApi.getAll(workshopId!), ...queryOptions })
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({ queryKey: ['invoices', workshopId], queryFn: () => invoicesApi.getAll(workshopId!), ...queryOptions })
  const { data: employees = [] } = useQuery({ queryKey: ['employees', workshopId], queryFn: () => employeesApi.getAll(workshopId!), ...queryOptions })
  const { data: inventory = [] } = useQuery({ queryKey: ['inventoryAvailability', workshopId], queryFn: () => inventoryApi.getAvailability(workshopId!), ...queryOptions })
  const { data: partRequests = [] } = useQuery({ queryKey: ['partRequests', workshopId], queryFn: () => partRequestsApi.getForWorkshop(workshopId!), ...queryOptions })
  const activeJobs = useMemo(() => jobs.filter(activeJob).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), [jobs])
  const taskQueries = useQueries({ queries: activeJobs.map((job) => ({ queryKey: ['jobTasks', job.id], queryFn: () => jobTasksApi.getAll(workshopId!, job.id), enabled: !!workshopId })) })
  const tasks: JobTaskResponse[] = taskQueries.flatMap((query) => query.data || [])
  const peopleById = new Map<string, EmployeeResponse>(employees.map((employee) => [employee.id, employee]))
  const needsAssignment = tasks.filter((task) => !task.assignedToUserId && task.status !== 'Completed' && task.status !== 'Cancelled')
  const unassignedParts = partRequests.filter((request) => request.status === 'Pending').length
  const readyJobs = activeJobs.filter((job) => job.status === 'ReadyForDelivery').length
  const needsApproval = activeJobs.filter((job) => job.status === 'AwaitingApproval').length
  const draftInvoices = invoices.filter((invoice) => invoice.status === 'Draft')
  const lowStock = inventory.filter((part) => part.stockQuantity <= 5 && part.isActive)
  const urgentCount = needsAssignment.length + needsApproval + unassignedParts
  const busy = jobsLoading || customersLoading || invoicesLoading

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500"><Building2 className="h-3.5 w-3.5" /> Front Desk · Daily workflow</div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Your workshop, at a glance.</h1>
          <p className="mt-1 text-sm text-slate-500">Intake, mechanic handoffs and customer follow-ups for today.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => navigate('/customers')}>Add customer</Button>
          <Button size="sm" variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/jobs')}>Create job card</Button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard label="Active jobs" value={String(activeJobs.length)} note={`${jobs.filter((job) => job.status === 'Completed').length} completed`} icon={<BriefcaseBusiness />} accent="rose" loading={busy} />
        <MetricCard label="Needs a mechanic" value={String(needsAssignment.length)} note="Open tasks waiting for assignment" icon={<UserRoundCheck />} accent={needsAssignment.length ? 'amber' : 'emerald'} loading={busy || taskQueries.some((query) => query.isLoading)} />
        <MetricCard label="Customer approvals" value={String(needsApproval)} note="Jobs waiting for customer decision" icon={<AlertCircle />} accent={needsApproval ? 'amber' : 'slate'} loading={busy} />
        <MetricCard label="Ready for pickup" value={String(readyJobs)} note="Completed repair, delivery follow-up" icon={<CheckCircle2 />} accent="emerald" loading={busy} />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,.8fr)]">
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
            <div><h2 className="text-sm font-semibold text-slate-900">Today’s job queue</h2><p className="mt-0.5 text-xs text-slate-500">Open a job to update details, assign work or track progress.</p></div>
            <Link to="/jobs" className="text-xs font-semibold text-slate-600 hover:text-rose-700">All jobs <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
          </div>
          {activeJobs.length === 0 ? <div className="flex min-h-44 flex-col items-center justify-center px-4 text-center"><BriefcaseBusiness className="mb-2 h-5 w-5 text-slate-400" /><p className="text-sm font-medium text-slate-700">No open jobs</p><p className="mt-1 text-xs text-slate-500">New customer visits will appear here once you create a job card.</p></div> : (
            <div className="divide-y divide-slate-100">
              {activeJobs.slice(0, 8).map((job) => {
                const jobTasks = tasks.filter((task) => task.jobCardId === job.id && task.status !== 'Completed' && task.status !== 'Cancelled')
                const taskLoading = taskQueries[activeJobs.findIndex((item) => item.id === job.id)]?.isLoading
                const assignees = [...new Set(jobTasks.map((task) => task.assignedToUserId).filter((id): id is string => !!id))].map((id) => peopleById.get(id)?.username).filter(Boolean)
                return <button key={job.id} onClick={() => navigate(`/jobs/${job.id}`)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-500"><Wrench className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-x-2"><span className="font-mono text-xs font-semibold text-slate-900">{job.vehicleRegistrationNumber}</span><span className="truncate text-xs text-slate-500">{job.vehicleMake} {job.vehicleModel}</span></span><span className="mt-1 block truncate text-sm text-slate-700">{job.title}</span><span className="mt-1 block truncate text-[11px] text-slate-500">{taskLoading ? 'Checking assignments…' : assignees.length ? `Mechanic${assignees.length > 1 ? 's' : ''}: ${assignees.join(', ')}` : jobTasks.length ? 'Tasks need mechanic assignment' : 'No tasks added yet'}</span></span>
                  <span className="hidden sm:block"><StatusBadge status={job.status} type="job" /></span><ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                </button>
              })}
            </div>
          )}
          <div className="border-t border-slate-100 px-4 py-3"><Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-rose-700">Open job board <ArrowRight className="h-3.5 w-3.5" /></Link></div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">Follow up</h2><p className="mt-0.5 text-xs text-slate-500">Items that may need your attention.</p>
          <div className="mt-4 space-y-2">
            <FollowupLink to="/jobs" icon={<ClipboardCheck />} label="Tasks without a mechanic" count={needsAssignment.length} />
            <FollowupLink to="/jobs" icon={<AlertCircle />} label="Waiting for customer approval" count={needsApproval} />
            <FollowupLink to="/parts-requests" icon={<Boxes />} label="Parts requests to process" count={unassignedParts} />
            <FollowupLink to="/jobs" icon={<CheckCircle2 />} label="Ready for customer pickup" count={readyJobs} />
          </div>
          <div className="mt-4 rounded-md border border-slate-100 bg-slate-50 p-3"><p className="text-xs font-medium text-slate-700">Mechanic coverage</p><p className="mt-1 text-[11px] leading-4 text-slate-500">{employees.filter((employee) => employee.isActive && (employee.employeeRole === 'Mechanic' || employee.employeeRole === 'Technician')).length} active mechanics · {tasks.filter((task) => task.assignedToUserId && task.status !== 'Completed').length} assigned open tasks</p></div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FrontDeskTile to="/customers" icon={<Users2 />} title="Customers & vehicles" detail={`${customers.length} customer records · register a visit`} />
        <FrontDeskTile to="/inventory-availability" icon={<Package />} title="Parts availability" detail={`${lowStock.length} low-stock items · check before promising`} />
        <FrontDeskTile to="/invoices" icon={<FileText />} title="Billing desk" detail={`${draftInvoices.length} draft invoices · prepare and follow up`} />
      </section>
    </div>
  )
}

function FollowupLink({ to, icon, label, count }: { to: string; icon: React.ReactNode; label: string; count: number }) {
  return <Link to={to} className="flex items-center gap-2.5 rounded-md border border-slate-100 px-3 py-2.5 hover:border-slate-200 hover:bg-slate-50"><span className="text-slate-500 [&>svg]:h-4 [&>svg]:w-4">{icon}</span><span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">{label}</span><span className={`min-w-6 rounded px-1.5 py-0.5 text-center text-[11px] font-semibold ${count ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{count}</span></Link>
}

function FrontDeskTile({ to, icon, title, detail }: { to: string; icon: React.ReactNode; title: string; detail: string }) {
  return <Link to={to} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3.5 hover:border-slate-300 hover:shadow-sm"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-600 [&>svg]:h-4 [&>svg]:w-4">{icon}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-800">{title}</span><span className="mt-1 block truncate text-[11px] text-slate-500">{detail}</span></span><ChevronRight className="h-4 w-4 shrink-0 text-slate-400" /></Link>
}

function MetricCard({ label, value, note, icon, accent, loading }: { label: string; value: string; note: string; icon: React.ReactNode; accent: 'emerald' | 'rose' | 'blue' | 'amber' | 'slate'; loading: boolean }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-700', rose: 'bg-rose-50 text-rose-700',
    blue: 'bg-blue-50 text-blue-700', amber: 'bg-amber-50 text-amber-700', slate: 'bg-slate-100 text-slate-600',
  }
  return <div className="rounded-lg border border-slate-200 bg-white p-4">
    <div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-slate-500">{label}</p><span className={`flex h-8 w-8 items-center justify-center rounded-md [&>svg]:h-4 [&>svg]:w-4 ${colors[accent]}`}>{icon}</span></div>
    <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{loading ? '—' : value}</p>
    <p className="mt-1 truncate text-xs text-slate-500">{note}</p>
  </div>
}

function JobViewButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return <button onClick={onClick} className={`rounded px-2.5 py-1.5 text-xs font-medium transition ${active ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>{label}<span className={`ml-1.5 ${active ? 'text-slate-300' : 'text-slate-400'}`}>{count}</span></button>
}

function SnapshotRow({ label, value, detail, icon, tone }: { label: string; value: string; detail: string; icon: React.ReactNode; tone: 'emerald' | 'amber' | 'blue' | 'rose' | 'slate' }) {
  const colors = { emerald: 'text-emerald-600', amber: 'text-amber-600', blue: 'text-blue-600', rose: 'text-rose-600', slate: 'text-slate-500' }
  return <div className="flex items-center gap-3"><span className={`${colors[tone]} [&>svg]:h-4 [&>svg]:w-4`}>{icon}</span><div className="min-w-0 flex-1"><p className="text-xs font-medium text-slate-700">{label}</p><p className="mt-0.5 truncate text-[11px] text-slate-400">{detail}</p></div><p className="text-sm font-semibold text-slate-900">{value}</p></div>
}

function ManagementLink({ to, title, description, icon, meta }: { to: string; title: string; description: string; icon: React.ReactNode; meta: string }) {
  return <Link to={to} className={sectionCard}><div className="flex items-start justify-between gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600 [&>svg]:h-4 [&>svg]:w-4">{icon}</span><ArrowUpRight className="h-4 w-4 text-slate-400" /></div><h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3><p className="mt-1 min-h-8 text-xs leading-4 text-slate-500">{description}</p><p className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] font-medium text-slate-500">{meta}</p></Link>
}

function QuickLink({ to, icon, title, detail }: { to: string; icon: React.ReactNode; title: string; detail: string }) {
  return <Link to={to} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 hover:border-slate-300 hover:bg-slate-50"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600 [&>svg]:h-4 [&>svg]:w-4">{icon}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-800">{title}</span><span className="mt-0.5 block truncate text-[11px] text-slate-500">{detail}</span></span><ArrowDownRight className="h-4 w-4 shrink-0 text-slate-400" /></Link>
}
