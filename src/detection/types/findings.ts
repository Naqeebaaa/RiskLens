//RuleFinding — rule kya output return karega.
export interface RuleFinding {
  ruleId: string;
  ruleName: string;
  description: string;
}

export interface DetectionFinding extends RuleFinding {
  accountId: string;
  transactionId: string;
}

// Is separation ka faida:
// - RuleFinding: individual rule ka result.
// - DetectionFinding: orchestration service ka enriched result, jisme monitored account aur triggering transaction ki identity bhi hogi.