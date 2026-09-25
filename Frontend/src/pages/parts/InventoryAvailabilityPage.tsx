import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Package } from 'lucide-react'
import { inventoryApi } from '@/api/inventory'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { useAuthStore } from '@/store/authStore'

export const InventoryAvailabilityPage: React.FC = () => {
  const { workshopId } = useAuthStore()
  const [search, setSearch] = useState('')
  const { data: parts = [], isLoading } = useQuery({
    queryKey: ['inventoryAvailability', workshopId],
    queryFn: () => inventoryApi.getAvailability(workshopId!),
    enabled: !!workshopId,
  })
  const visibleParts = parts.filter((part) => part.isActive && (
    part.name.toLowerCase().includes(search.toLowerCase())
    || part.partNumber.toLowerCase().includes(search.toLowerCase())
  ))

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-bold text-slate-900">Parts Availability</h1>
        <p className="mt-1 text-sm text-slate-500">Check available stock. Inventory master changes are restricted to Admin.</p>
      </header>
      <div className="max-w-md">
        <Input placeholder="Search by part name or number" leftIcon={<Search className="h-4 w-4" />} value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>
      {isLoading ? <div className="flex justify-center p-12"><Spinner size="lg" /></div> : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">Part</th><th className="px-4 py-3">Part Number</th><th className="px-4 py-3">Availability</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleParts.map((part) => (
                <tr key={part.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{part.name}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{part.partNumber}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold ${part.stockQuantity > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      <Package className="h-3.5 w-3.5" /> {part.stockQuantity} in stock
                    </span>
                  </td>
                </tr>
              ))}
              {visibleParts.length === 0 && <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={3}>No parts found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
