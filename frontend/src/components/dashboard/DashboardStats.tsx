export interface DashboardMetrics {
  totalAlerts: number
  medium: number
  high: number
  critical: number
  new: number
  investigating: number
  closed: number
}

interface DashboardStatsProps {
  metrics: DashboardMetrics
}

const statStyles = {
  slate: 'border-l-slate-300',
  amber: 'border-l-amber-400',
  orange: 'border-l-orange-400',
  rose: 'border-l-rose-400',
  sky: 'border-l-sky-400',
  violet: 'border-l-violet-400',
  green: 'border-l-emerald-400',
}

export function DashboardStats({ metrics }: DashboardStatsProps) {
  const stats = [
    { label: 'Total alerts', value: metrics.totalAlerts, tone: 'slate' },
    { label: 'Medium risk', value: metrics.medium, tone: 'amber' },
    { label: 'High risk', value: metrics.high, tone: 'orange' },
    { label: 'Critical risk', value: metrics.critical, tone: 'rose' },
    { label: 'New', value: metrics.new, tone: 'sky' },
    { label: 'Investigating', value: metrics.investigating, tone: 'violet' },
    { label: 'Closed', value: metrics.closed, tone: 'green' },
  ] as const

  return (
    <section aria-label="Alert counts" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {stats.map((stat) => (
        <article
          key={stat.label}
          className={`rounded-xl border border-slate-200 border-l-[3px] bg-white p-4 shadow-[0_1px_2px_rgba(16,28,50,0.03)] sm:p-5 ${statStyles[stat.tone]}`}
        >
          <p className="text-xs font-medium text-slate-500">{stat.label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-[#17243b]">
            {stat.value.toLocaleString()}
          </p>
        </article>
      ))}
    </section>
  )
}
