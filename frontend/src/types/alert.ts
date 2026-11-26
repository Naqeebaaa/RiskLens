export type RiskLevel = 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type AlertStatus = 'NEW' | 'INVESTIGATING' | 'CLOSED'

export interface Alert {
  id: string
  account_id: string
  transaction_id: string
  risk_score: number
  risk_level: RiskLevel
  triggered_rules: string[]
  status: AlertStatus
  created_at: string
}
