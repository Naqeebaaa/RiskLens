import { StatusBadge, RiskBadge } from '../alerts/AlertBadges'
import type { Alert } from '../../types/alert'

interface RecentAlertsTableProps {
  alerts: Alert[]
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export function RecentAlertsTable({ alerts }: RecentAlertsTableProps) {
  const recentAlerts = [...alerts]
    .sort(
      (left, right) =>
        Date.parse(right.created_at) - Date.parse(left.created_at),
    )
    .slice(0, 6)

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,28,50,0.03)]">
      <div className="flex items-center justify-between gap-3 px-5 py-5 sm:px-6">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Recent alerts</h2>
          <p className="mt-1 text-xs text-slate-500">
            Latest alert records from the monitoring system
          </p>
        </div>
        {alerts.length > 0 && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium tabular-nums text-slate-600">
            {recentAlerts.length} of {alerts.length.toLocaleString()}
          </span>
        )}
      </div>

      {recentAlerts.length === 0 ? (
        <div className="border-t border-slate-100 px-5 py-12 text-center sm:px-6">
          <p className="text-sm font-medium text-slate-700">No alerts to display</p>
          <p className="mt-1 text-xs text-slate-500">
            The alerts API returned no records.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border-t border-slate-100">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-5 py-3 text-[10px] font-semibold tracking-[0.12em] text-slate-500 uppercase sm:px-6">
                  Account ID
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold tracking-[0.12em] text-slate-500 uppercase">
                  Transaction ID
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold tracking-[0.12em] text-slate-500 uppercase">
                  Risk
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold tracking-[0.12em] text-slate-500 uppercase">
                  Status
                </th>
                <th className="px-5 py-3 text-[10px] font-semibold tracking-[0.12em] text-slate-500 uppercase sm:px-6">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAlerts.map((alert) => (
                <tr key={alert.id} className="transition-colors hover:bg-slate-50/70">
                  <td className="max-w-44 px-5 py-4 sm:px-6">
                    <span
                      className="block truncate font-mono text-xs text-slate-700"
                      title={alert.account_id}
                    >
                      {alert.account_id}
                    </span>
                  </td>
                  <td className="max-w-48 px-4 py-4">
                    <span
                      className="block truncate font-mono text-xs text-slate-500"
                      title={alert.transaction_id}
                    >
                      {alert.transaction_id}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2.5">
                      <RiskBadge riskLevel={alert.risk_level} />
                      <span
                        aria-label={`Risk score ${alert.risk_score}`}
                        className="inline-flex shrink-0 items-baseline gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1"
                      >
                        <span className="text-[9px] font-semibold tracking-wide text-slate-500 uppercase">
                          Score
                        </span>
                        <span className="text-xs font-semibold tabular-nums text-slate-700">
                          {alert.risk_score}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={alert.status} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500 sm:px-6">
                    <time dateTime={alert.created_at}>
                      {dateFormatter.format(new Date(alert.created_at))}
                    </time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
