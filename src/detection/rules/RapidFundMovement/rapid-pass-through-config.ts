export interface RapidPassThroughRuleConfig {
  windowDurationMs: number;
  minimumIncomingAmount: string;
  minimumOutgoingTransactionCount: number;
  minimumUniqueBeneficiaries: number;
  minimumOutflowRatio: number;
  currency: string;
}