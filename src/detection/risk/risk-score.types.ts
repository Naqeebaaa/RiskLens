// Is file mein do cheezein define hongi:
// 1. RiskLevel — allowed risk levels ki union type.
// 2. AccountRisk — scoring service ka output contract.

export type RiskLevel = 
  | "NO_RISK"
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";
export interface AccountRisk {
  accountId: string;
  transactionId: string;
  riskScore: number;
   riskLevel: RiskLevel;
  triggeredRules: string[];
}

// Why separate type?
// Agar kal Alert Service, API response ya Dashboard ko
//  RiskLevel chahiye ho, toh woh isi type ko import kar sakte hain. 
//  Duplicate union types likhne ki zaroorat nahi.