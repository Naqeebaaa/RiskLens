export function DashboardLoading() {
  return (
    <div
      aria-label="Loading dashboard data"
      aria-live="polite"
      className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white text-center shadow-[0_1px_2px_rgba(16,28,50,0.03)]"
      role="status"
    >
      <span className="size-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-teal-600" />
      <p className="mt-4 text-sm font-medium text-slate-700">Loading alert data</p>
      <p className="mt-1 text-xs text-slate-500">
        Retrieving the latest records from RiskLens
      </p>
    </div>
  )
}
