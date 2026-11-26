export function TopNavigation() {
  return (
    <header className="top-header">
      <div className="brand-lockup">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 28 28" fill="none">
            <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m17 17 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <span className="brand-name">RiskLens</span>
        <span className="brand-pill">AML Transaction Monitoring</span>
      </div>
      <div className="header-actions">
        <button className="simulate-button" type="button" disabled title="Simulation workflow is not available">
          Simulate Burst
        </button>
        <div className="analyst-profile">
          <span className="analyst-avatar" aria-hidden="true">CA</span>
          <div>
            <p>Compliance Analyst</p>
            <span><i /> System: Online (18ms latency)</span>
          </div>
        </div>
      </div>
    </header>
  )
}
