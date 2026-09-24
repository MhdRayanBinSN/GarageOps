import React from 'react'
import { Spinner } from './Spinner'
import { EmptyState } from './EmptyState'

export interface Column<T> {
  key: string
  header: React.ReactNode
  render?: (item: T) => React.ReactNode
  className?: string
}

export interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string
  isLoading?: boolean
  emptyMessage?: string
  emptyActionLabel?: string
  onEmptyAction?: () => void
  onRowClick?: (item: T) => void
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No records found',
  emptyActionLabel,
  onEmptyAction,
  onRowClick,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Spinner size="lg" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
        className="my-4"
      />
    )
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs">
      <table className="w-full text-left text-sm text-slate-700">
        <thead className="bg-slate-50/80 text-xs uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-200">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-3 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-normal">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick && onRowClick(item)}
              className={`transition-colors duration-150 ${
                onRowClick ? 'cursor-pointer hover:bg-slate-50/80 active:bg-slate-100/60' : 'hover:bg-slate-50/50'
              }`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 whitespace-nowrap ${col.className || ''}`}>
                  {col.render
                    ? col.render(item)
                    : (item as Record<string, unknown>)[col.key] !== undefined
                    ? String((item as Record<string, unknown>)[col.key])
                    : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
