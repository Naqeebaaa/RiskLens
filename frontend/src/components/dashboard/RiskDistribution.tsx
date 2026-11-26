import type { RiskLevel } from '../../types/alert'

interface RiskDistributionProps {
  counts: Record<RiskLevel, number>
  total: number
}

const riskRows: Array<{
  level: RiskLevel
  barColor: string
  textColor: string
}> = [
  { level: 'MEDIUM', barColor: 'bg-amber-400', textColor: 'text-amber-700' },
  { level: 'HIGH', barColor: 'bg-orange-500', textColor: 'text-orange-700' },
  { level: 'CRITICAL', barColor: 'bg-rose-500', textColor: 'text-rose-700' },
]

const percentageFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
})

function getPercentage(count: number, total: number): number {
  return total > 0 ? (count / total) * 100 : 0
}

export function RiskDistribution({ counts, total }: RiskDistributionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,28,50,0.03)] sm:p-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-800">Risk distribution</h2>
        <p className="mt-1 text-xs text-slate-500">Alerts grouped by risk level</p>
      </div>

      {total === 0 ? (
        <p className="mt-8 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          Risk distribution is unavailable until alerts are received.
        </p>
      ) : (
        <>
          <div
            aria-label="Risk distribution chart"
            className="mt-7 flex h-3 overflow-hidden rounded-full bg-slate-100"
            role="img"
          >
            {riskRows.map(({ level, barColor }) => {
              const percentage = getPercentage(counts[level], total)

              return (
                <div
                  key={level}
                  className={barColor}
                  style={{ width: `${percentage}%` }}
                />
              )
            })}
          </div>

          <div className="mt-6 space-y-4">
            {riskRows.map(({ level, barColor, textColor }) => {
              const count = counts[level]
              const percentage = getPercentage(count, total)

              return (
                <div key={level} className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className={`size-2 rounded-full ${barColor}`} />
                    <span className="text-xs font-medium text-slate-600">{level}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    <span
                      aria-label={`${count} ${count === 1 ? 'alert' : 'alerts'}`}
                      className="inline-flex min-w-[5.5rem] justify-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium tabular-nums text-slate-600"
                    >
                      {count.toLocaleString()} {count === 1 ? 'alert' : 'alerts'}
                    </span>
                    <span
                      className={`min-w-[4.25rem] rounded-md border border-slate-200 px-2 py-1 text-right text-xs font-semibold tabular-nums ${textColor}`}
                    >
                      {percentageFormatter.format(percentage)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}
