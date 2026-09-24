/** Format a number as currency (LKR / generic) */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

/** Format an ISO date string to a readable date */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso))
}

/** Format an ISO date string to a readable date + time */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

/** Extract a readable error message from an Axios error or unknown */
export function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>
    if (e.response && typeof e.response === 'object') {
      const resp = e.response as Record<string, unknown>
      if (resp.data && typeof resp.data === 'object') {
        const data = resp.data as Record<string, unknown>
        if (typeof data.message === 'string') return data.message
        if (typeof data.title === 'string') return data.title
      }
      if (typeof resp.data === 'string') return resp.data
    }
    if (typeof e.message === 'string') return e.message
  }
  return 'An unexpected error occurred.'
}

/** Returns initials from a name or username */
export function getInitials(name: string): string {
  return name
    .split(/[\s_]/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}
