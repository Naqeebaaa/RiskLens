import { useEffect, useMemo, useState } from 'react'
import { getAlerts } from '../services/alert.service'
import type { Alert, RiskLevel } from '../types/alert'

type DashboardState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; alerts: Alert[] }

type RiskFilter = 'ALL' | RiskLevel

const pageSize = 6

const ruleLabels: Record<string, string> = {
  'structuring-threshold-avoidance': 'Structuring / Threshold Avoidance',
  'temporal-spatial-smurfing': 'Temporal & Spatial Smurfing',
  'rapid-pass-through': 'Rapid Pass-Through / Mule Activity',
  'dormant-account-reactivation': 'Dormant Account Reactivation',
}

export function DashboardPage() {
  const [state, setState] = useState<DashboardState>({ status: 'loading' })
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let active = true

    void getAlerts()
      .then((alerts) => {
        if (active) setState({ status: 'success', alerts })
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            status: 'error',
            message: error instanceof Error
              ? error.message
              : 'An unexpected error occurred while loading alerts.',
          })
        }
      })

    return () => {
      active = false
    }
  }, [retryCount])

  function retry() {
    setState({ status: 'loading' })
    setRetryCount((count) => count + 1)
  }

  return (
    <div className="dashboard-shell">
      {state.status === 'loading' && (
        <section className="loading-state" role="status">Loading alert data...</section>
      )}
      {state.status === 'error' && (
        <section className="error-state" role="alert">
          <p>{state.message}</p>
          <button type="button" onClick={retry}>Retry</button>
        </section>
      )}
      {state.status === 'success' && <DashboardContent alerts={state.alerts} />}
    </div>
  )
}

function DashboardContent({ alerts }: { alerts: Alert[] }) {
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(alerts[0]?.id ?? '')

  const filteredAlerts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return alerts.filter((alert) => {
      if (riskFilter !== 'ALL' && alert.risk_level !== riskFilter) return false
      if (!query) return true
      return alert.account_id.toLowerCase().includes(query) ||
        alert.id.toLowerCase().includes(query)
    })
  }, [alerts, riskFilter, search])

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const visibleAlerts = filteredAlerts.slice(startIndex, startIndex + pageSize)
  const selectedAlert = alerts.find((alert) => alert.id === selectedId) ??
    filteredAlerts[0] ??
    alerts[0]

  const criticalCount = alerts.filter((alert) => alert.risk_level === 'CRITICAL').length
  const highCount = alerts.filter((alert) => alert.risk_level === 'HIGH').length
  const mediumCount = alerts.filter((alert) => alert.risk_level === 'MEDIUM').length
  const actionCount = criticalCount + highCount

  const ruleCounts = new Map<string, number>()
  alerts.forEach((alert) => {
    alert.triggered_rules.forEach((rule) => {
      ruleCounts.set(rule, (ruleCounts.get(rule) ?? 0) + 1)
    })
  })
  const topRule = [...ruleCounts.entries()].sort((a, b) => b[1] - a[1])[0]
  const topRuleLabel = topRule ? (ruleLabels[topRule[0]] ?? topRule[0]) : 'Unavailable'
  const topRulePercent = topRule && alerts.length
    ? Math.round((topRule[1] / alerts.length) * 100)
    : null

  return (
    <>
      <section className="kpi-grid" aria-label="Alert summary">
        <article className="kpi-card">
          <p>Critical &amp; High Alerts</p>
          <strong>{actionCount}</strong>
          <span>{actionCount} action required · Unassigned unavailable</span>
        </article>
        <article className="kpi-card">
          <p>24h Flagged Volume</p>
          <strong className="unavailable-value">—</strong>
          <span>Transaction volume unavailable</span>
        </article>
        <article className="kpi-card">
          <p>Top Triggered Rule</p>
          <strong className={topRule ? 'rule-value' : 'unavailable-value'}>
            {topRuleLabel}
          </strong>
          <span>
            {topRule
              ? `${topRule[1]} alerts${topRulePercent === null ? '' : ` · ${topRulePercent}% of total`}`
              : 'No triggered rule data'}
          </span>
        </article>
        <article className="kpi-card">
          <p>DLQ / Queue Health</p>
          <strong className="unavailable-value">—</strong>
          <span>RabbitMQ health unavailable</span>
        </article>
      </section>

      <div className="workspace-grid">
        <section className="alert-queue panel">
          <h2>Alert Queue</h2>
          <div className="filter-row" aria-label="Filter alerts by risk">
            {([
              ['ALL', 'All'],
              ['CRITICAL', 'Critical'],
              ['HIGH', 'High'],
              ['MEDIUM', 'Medium'],
              ['LOW', 'Low'],
            ] as [string, string][]).map(([filter, label]) => {
              const count = filter === 'ALL'
                ? alerts.length
                : filter === 'CRITICAL'
                  ? criticalCount
                  : filter === 'HIGH'
                    ? highCount
                    : filter === 'MEDIUM'
                      ? mediumCount
                      : 0
              return (
                <button
                  key={filter}
                  type="button"
                  className={`filter-chip ${filter.toLowerCase()} ${riskFilter === filter ? 'active' : ''}`}
                  onClick={() => {
                    if (filter === 'LOW') {
                      setRiskFilter('ALL')
                    } else {
                      setRiskFilter(filter as RiskFilter)
                    }
                    setPage(1)
                  }}
                >
                  {label}{count > 0 ? ` (${count})` : ''}
                </button>
              )
            })}
          </div>

          <label className="search-field">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="m12.3 12.3 4.2 4.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search Account ID, Alert ID..."
            />
          </label>

          <div className="table-scroll">
            <table className="alert-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Account ID</th>
                  <th>Type &amp; Amount</th>
                  <th>Risk Score</th>
                  <th>Triggered Rules</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className={selectedAlert?.id === alert.id ? 'selected' : ''}
                    onClick={() => setSelectedId(alert.id)}
                  >
                    <td><time dateTime={alert.created_at}>{formatTime(alert.created_at)}</time></td>
                    <td>{alert.account_id}</td>
                    <td className="muted-cell">Unavailable</td>
                    <td><span className={`score-pill ${alert.risk_level.toLowerCase()}`}>{alert.risk_score}</span></td>
                    <td>
                      <span className="rule-tag">
                        {alert.triggered_rules[0]
                          ? ruleLabels[alert.triggered_rules[0]] ?? alert.triggered_rules[0]
                          : 'Unavailable'}
                      </span>
                      {alert.triggered_rules.length > 1 &&
                        <span className="rule-tag more">+{alert.triggered_rules.length - 1}</span>}
                    </td>
                    <td><span className={`status-pill ${alert.status.toLowerCase()}`}>{formatStatus(alert.status)}</span></td>
                  </tr>
                ))}
                {visibleAlerts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty-row">No alerts match the current filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="table-footer">
            <span>
              Showing {filteredAlerts.length === 0 ? 0 : startIndex + 1}–
              {Math.min(startIndex + pageSize, filteredAlerts.length)} of {filteredAlerts.length} alerts · Page {safePage} of {totalPages}
            </span>
            <div className="pagination">
              <button type="button" disabled={safePage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                ‹ <span>Prev</span>
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 4).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={pageNumber === safePage ? 'current' : ''}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
              <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
                <span>Next</span> ›
              </button>
            </div>
          </footer>
        </section>

        <aside className="investigation-panel panel">
          {selectedAlert ? (
            <>
              <header className="investigation-header">
                <div>
                  <h2>Alert #{selectedAlert.id} — Score {selectedAlert.risk_score}/100 ({selectedAlert.risk_level})</h2>
                  <p>Account {selectedAlert.account_id} · {formatStatus(selectedAlert.status)} · Transaction {selectedAlert.transaction_id}</p>
                </div>
                <span className={`risk-badge ${selectedAlert.risk_level.toLowerCase()}`}>
                  {selectedAlert.risk_level}
                </span>
              </header>

              <section className="inset-section evidence-section">
                <h3>Rule Evidence &amp; Findings</h3>
                {selectedAlert.triggered_rules.length > 0 ? (
                  <ul>
                    {selectedAlert.triggered_rules.map((rule) => (
                      <li key={rule}>{ruleLabels[rule] ?? rule}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Investigation evidence is not yet available.</p>
                )}
              </section>

              <section className="detail-section">
                <h3>Historical Context</h3>
                <p>Historical context is not available yet.</p>
              </section>

              <section className="detail-section notes-section">
                <h3>Analyst Notes</h3>
                <textarea
                  disabled
                  placeholder="Add investigation notes, pattern analysis, or reasons for escalation..."
                  title="Note persistence is not available"
                />
              </section>

              <footer className="investigation-actions">
                <button type="button" disabled title="Dismiss workflow is not available">
                  Dismiss (False Positive)
                </button>
                <button type="button" disabled title="Escalation workflow is not available">
                  Escalate (SAR)
                </button>
              </footer>
            </>
          ) : (
            <div className="empty-investigation">Select an alert to begin investigation.</div>
          )}
        </aside>
      </div>
    </>
  )
}

function formatTime(createdAt: string) {
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return 'Unavailable'
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

function formatStatus(status: Alert['status']) {
  if (status === 'INVESTIGATING') return 'Investigation'
  if (status === 'CLOSED') return 'Closed'
  return 'Open'
}
