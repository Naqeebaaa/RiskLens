import { AlertsPlaceholder } from '../components/alerts/AlertsPlaceholder'

export function AlertsPage() {
  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-teal-700 uppercase">
          Monitoring queue
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#17243b] sm:text-[34px]">
          Alerts
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Review rule-triggered activity and prioritize alerts for investigation.
          A triggered rule is an indicator, not proof of wrongdoing.
        </p>
      </div>
      <AlertsPlaceholder />
    </div>
  )
}
