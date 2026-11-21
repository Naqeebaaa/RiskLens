export interface DormantAccountRuleConfig {
  dormancyPeriodMs: number; //90 days ko milliseconds mein represent karega.
  minimumReactivationAmount: string; //"500000" — string rakhenge because money calculations mein Decimal.js use kar rahe hain.
  currency: string;
}