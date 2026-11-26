import type { AlertStatus, RiskLevel } from '../../types/alert'

const riskStyles: Record<RiskLevel, string> = {
  MEDIUM: 'bg-amber-50 text-amber-800 ring-amber-200',
  HIGH: 'bg-orange-50 text-orange-800 ring-orange-200',
  CRITICAL: 'bg-rose-50 text-rose-800 ring-rose-200',
}

const statusStyles: Record<AlertStatus, string> = {
  NEW: 'bg-sky-50 text-sky-800 ring-sky-200',
  INVESTIGATING: 'bg-violet-50 text-violet-800 ring-violet-200',
  CLOSED: 'bg-slate-100 text-slate-700 ring-slate-200',
}

export function RiskBadge({ riskLevel }: { riskLevel: RiskLevel }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ring-1 ring-inset ${riskStyles[riskLevel]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {riskLevel}
    </span>
  )
}

export function StatusBadge({ status }: { status: AlertStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ring-1 ring-inset ${statusStyles[status]}`}
    >
      {status}
    </span>
  )
}
