import type { Alert, AlertStatus, RiskLevel } from '../types/alert'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isRiskLevel(value: unknown): value is RiskLevel {
  return value === 'MEDIUM' || value === 'HIGH' || value === 'CRITICAL'
}

function isAlertStatus(value: unknown): value is AlertStatus {
  return value === 'NEW' || value === 'INVESTIGATING' || value === 'CLOSED'
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function getApiMessage(payload: unknown): string | undefined {
  if (isRecord(payload) && isNonEmptyString(payload.message)) {
    return payload.message
  }

  return undefined
}

function parseAlert(value: unknown, index: number): Alert {
  if (!isRecord(value)) {
    throw new Error(`Alert at position ${index + 1} is not a valid object.`)
  }

  const {
    id,
    account_id,
    transaction_id,
    risk_score,
    risk_level,
    triggered_rules,
    status,
    created_at,
  } = value

  if (
    !isNonEmptyString(id) ||
    !isNonEmptyString(account_id) ||
    !isNonEmptyString(transaction_id) ||
    typeof risk_score !== 'number' ||
    !Number.isInteger(risk_score) ||
    risk_score < 30 ||
    risk_score > 100 ||
    !isRiskLevel(risk_level) ||
    !isStringArray(triggered_rules) ||
    !isAlertStatus(status) ||
    !isNonEmptyString(created_at) ||
    !Number.isFinite(Date.parse(created_at))
  ) {
    throw new Error(`Alert at position ${index + 1} has invalid or missing fields.`)
  }

  return {
    id,
    account_id,
    transaction_id,
    risk_score,
    risk_level,
    triggered_rules,
    status,
    created_at,
  }
}

export async function getAlerts(): Promise<Alert[]> {
  let response: Response

  try {
    response = await fetch('/api/alerts', {
      headers: { Accept: 'application/json' },
    })
  } catch {
    throw new Error(
      'Unable to reach the alerts API. Confirm the backend is running and retry.',
    )
  }

  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    if (!response.ok) {
      throw new Error(`Unable to load alerts (HTTP ${response.status}).`)
    }

    throw new Error('The alerts API returned an invalid JSON response.')
  }

  if (!response.ok) {
    throw new Error(
      getApiMessage(payload) ?? `Unable to load alerts (HTTP ${response.status}).`,
    )
  }

  if (!isRecord(payload)) {
    throw new Error('The alerts API returned an invalid response.')
  }

  if (payload.success !== true) {
    throw new Error(
      getApiMessage(payload) ?? 'The alerts API reported an unsuccessful response.',
    )
  }

  if (
    typeof payload.count !== 'number' ||
    !Number.isInteger(payload.count) ||
    payload.count < 0 ||
    !Array.isArray(payload.data)
  ) {
    throw new Error('The alerts API response is missing a valid count or data array.')
  }

  if (payload.count !== payload.data.length) {
    throw new Error('The alerts API count does not match the returned alert data.')
  }

  return payload.data.map((alert: unknown, index: number) =>
    parseAlert(alert, index),
  )
}
