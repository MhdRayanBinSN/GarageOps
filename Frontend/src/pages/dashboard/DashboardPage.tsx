import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { jobCardsApi } from '@/api/jobCards'
import { partsApi } from '@/api/parts'
import { customersApi } from '@/api/customers'
import { invoicesApi } from '@/api/invoices'
import { formatCurrency, formatDate } from '@/utils/formatting'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import {
  ClipboardList,
  DollarSign,
  AlertTriangle,
  Users,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
  Car,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

export const DashboardPage: React.FC = () => {
  const { workshopId } = useAuthStore()
  const navigate = useNavigate()

  const { data: jobCards = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['jobCards', workshopId],
    queryFn: () => jobCardsApi.getAll(workshopId!),
    enabled: !!workshopId,
  })

  const { data: parts = [], isLoading: partsLoading } = useQuery({
    queryKey: ['parts', workshopId],
    queryFn: () => partsApi.getAll(workshopId!),
    enabled: !!workshopId,
  })

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers', workshopId],
    queryFn: () => customersApi.getAll(workshopId!),
    enabled: !!workshopId,
  })

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices', workshopId],
    queryFn: () => invoicesApi.getAll(workshopId!),
    enabled: !!workshopId,
  })

  const isLoading = jobsLoading || partsLoading || customersLoading || invoicesLoading

  // Calculations
  const activeJobs = jobCards.filter((j) => j.status !== 'Completed' && j.status !== 'Cancelled')
  const completedJobs = jobCards.filter((j) => j.status === 'Completed')
  const lowStockParts = parts.filter((p) => p.stockQuantity <= 5 && p.isActive)
  const totalRevenue = invoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.total, 0)
  const pendingRevenue = invoices
    .filter((inv) => inv.status === 'Finalized')
    .reduce((sum, inv) => sum + inv.total, 0)

  // Status breakdown for BarChart
  const statusCounts: Record<string, number> = {}
  jobCards.forEach((j) => {
    statusCounts[j.status] = (statusCounts[j.status] || 0) + 1
  })
  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
  }))

  const PIE_COLORS = ['#C50022', '#B5AC8A', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B']

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 uppercase">
            Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time performance and workflow monitor
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/jobs')}
          >
            New Job Card
          </Button>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Users className="w-4 h-4" />}
            onClick={() => navigate('/customers')}
          >
            Add Customer
          </Button>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockParts.length > 0 && (
        <div className="p-4 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="text-sm font-medium">
              <strong className="font-bold">{lowStockParts.length} inventory items</strong> are at
              or below minimum threshold (5 units).
            </span>
          </div>
          <Link
            to="/parts"
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 underline flex items-center gap-1"
          >
            Review Stock <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* KPI Cards (Mix of Dark Hero Cards and Clean Light Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Jobs - DARK CARD */}
        <div className="p-5 rounded-lg bg-gradient-to-br from-white via-white to-slate-50 border border-slate-200 text-slate-900 relative overflow-hidden group shadow-xl shadow-black/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Active Job Cards
            </span>
            <div className="p-2 rounded-md bg-rose-50 text-brand-red border border-brand-red/30">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-black text-slate-900">
              {isLoading ? '...' : activeJobs.length}
            </span>
            <span className="text-xs text-slate-500">/ {jobCards.length} total</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{completedJobs.length} completed all-time</span>
          </div>
        </div>

        {/* Revenue (Paid) - DARK CARD */}
        <div className="p-5 rounded-lg bg-gradient-to-br from-white via-white to-emerald-50 border border-emerald-200 text-slate-900 relative overflow-hidden group shadow-xl shadow-black/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Collected Revenue
            </span>
            <div className="p-2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-600/30">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-black text-slate-900">
              {isLoading ? '...' : formatCurrency(totalRevenue)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-300/80">
            Pending:{' '}
            <span className="text-slate-500 font-semibold">{formatCurrency(pendingRevenue)}</span>
          </div>
        </div>

        {/* Low Stock Items - LIGHT CARD */}
        <div className="p-5 rounded-lg bg-white border border-slate-200 text-slate-900 relative overflow-hidden group hover:border-slate-300 transition-all shadow-xs hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Low Stock Parts
            </span>
            <div className="p-2 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-black text-slate-900">
              {isLoading ? '...' : lowStockParts.length}
            </span>
            <span className="text-xs text-slate-500">items</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Total parts in catalog: <span className="font-semibold text-slate-700">{parts.length}</span>
          </div>
        </div>

        {/* Customers - LIGHT CARD */}
        <div className="p-5 rounded-lg bg-white border border-slate-200 text-slate-900 relative overflow-hidden group hover:border-slate-300 transition-all shadow-xs hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Customers
            </span>
            <div className="p-2 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-black text-slate-900">
              {isLoading ? '...' : customers.length}
            </span>
            <span className="text-xs text-slate-500">registered</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Active workshops & accounts
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Bar Chart - LIGHT CARD */}
        <div className="lg:col-span-2 p-6 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 uppercase tracking-wider">
                Job Cards by Status
              </h3>
              <p className="text-xs text-slate-500">Real-time workflow distribution across repair stages</p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{jobCards.length} records</span>
          </div>

          {chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No jobs data available yet. Create your first job card to see metrics!
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="status"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#334155',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      color: '#334155',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#C50022" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Invoice Status Distribution Pie - DARK CARD */}
        <div className="p-6 rounded-lg bg-gradient-to-br from-white to-slate-50 border border-slate-200 text-slate-900 shadow-xl shadow-black/10 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 uppercase tracking-wider mb-1">
              Invoicing Breakdown
            </h3>
            <p className="text-xs text-slate-500 mb-4">Status of all generated invoices</p>
          </div>

          {invoices.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-slate-500">
              No invoice records yet
            </div>
          ) : (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Paid', value: invoices.filter((i) => i.status === 'Paid').length },
                      { name: 'Finalized', value: invoices.filter((i) => i.status === 'Finalized').length },
                      { name: 'Draft', value: invoices.filter((i) => i.status === 'Draft').length },
                      { name: 'Cancelled', value: invoices.filter((i) => i.status === 'Cancelled').length },
                    ].filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {PIE_COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#334155',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      color: '#334155',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Paid ({invoices.filter((i) => i.status === 'Paid').length})</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Finalized ({invoices.filter((i) => i.status === 'Finalized').length})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Job Cards Table Preview - LIGHT CARD */}
      <div className="rounded-lg bg-white border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-brand-red" />
            <h3 className="font-display text-base font-bold text-slate-900 uppercase tracking-wider">
              Recent Job Cards
            </h3>
          </div>
          <Link
            to="/jobs"
            className="text-xs font-semibold text-brand-red hover:text-red-700 flex items-center gap-1 transition-colors"
          >
            View all jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {jobCards.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400">
            No job cards recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="pb-3">Vehicle</th>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Created</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobCards.slice(0, 5).map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 font-semibold text-slate-900">
                      {job.vehicleRegistrationNumber}
                      <span className="block text-xs font-normal text-slate-500">
                        {job.vehicleMake} {job.vehicleModel} ({job.vehicleYear})
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-800 font-medium">{job.title}</td>
                    <td className="py-3.5">
                      <StatusBadge status={job.status} type="job" />
                    </td>
                    <td className="py-3.5 text-xs text-slate-500">{formatDate(job.createdAt)}</td>
                    <td className="py-3.5 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
