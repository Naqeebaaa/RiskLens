interface DashboardErrorProps {
  message: string
  onRetry: () => void
}

export function DashboardError({ message, onRetry }: DashboardErrorProps) {
  return (
    <section
      aria-labelledby="dashboard-error-title"
      className="rounded-2xl border border-rose-200 bg-white px-6 py-10 text-center shadow-[0_1px_2px_rgba(16,28,50,0.03)]"
      role="alert"
    >
      <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-rose-50 text-rose-700">
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 8.5v4m0 3h.01M10.3 4.9 2.8 18a1.5 1.5 0 0 0 1.3 2.2h15.8a1.5 1.5 0 0 0 1.3-2.2L13.7 4.9a2 2 0 0 0-3.4 0Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 id="dashboard-error-title" className="mt-4 text-base font-semibold text-slate-800">
        Could not load dashboard data
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        {message}
      </p>
      <button
        className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#172b48] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#223b60] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        onClick={onRetry}
        type="button"
      >
        Retry
      </button>
    </section>
  )
}
