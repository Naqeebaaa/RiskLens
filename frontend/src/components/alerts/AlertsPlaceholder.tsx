export function AlertsPlaceholder() {
  return (
    <section
      aria-labelledby="alerts-placeholder-title"
      className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-[0_1px_2px_rgba(16,28,50,0.03)] sm:px-10 sm:py-16"
    >
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <svg
          viewBox="0 0 24 24"
          className="size-6"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 3.5 20 7v5.1c0 4.1-2.8 7.3-8 9.4-5.2-2.1-8-5.3-8-9.4V7l8-3.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M12 8.5v4m0 3h.01"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h2
        id="alerts-placeholder-title"
        className="text-base font-semibold text-slate-800"
      >
        Alert review is coming next
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
        The alert table, client-side search, filters, and sorting will be
        connected to the backend in a later phase. No sample alerts are shown.
      </p>
    </section>
  )
}
