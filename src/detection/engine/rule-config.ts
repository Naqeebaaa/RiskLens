
import type { StructuringRuleConfig } from "../rules/structuring/structuring-rule-config.js";
import type { SmurfingRuleConfig } from "../rules/smurfing/smurfing-rule-config.js";
import type { RapidPassThroughRuleConfig } from "../rules/RapidFundMovement/rapid-pass-through-config.js";
import type { DormantAccountRuleConfig } from "../rules/DormantAccount/dormant-account-config.js";


//Adding 4 typed configurations objects bc typed configs tell typescript ke kisi object ke andar exactly kya data hona chahiye, aur us data ki type kya hogi.
//main purpose is to catch configuration mistakes at compile time before code execution
 export const structuringConfig: StructuringRuleConfig = { 
  threshold: "500000",
  nearThresholdPercentage: 90,
  minimumTransactionCount: 3,
  windowDurationMs: 24 * 60 * 60 * 1000,
};

  export const smurfingConfig: SmurfingRuleConfig = {
  windowDurationMs: 4 * 60 * 60 * 1000,
  minimumTransactionCount: 4,
  minimumUniqueLocations: 3,
  currency: "PKR",
};

 export const rapidPassThroughConfig: RapidPassThroughRuleConfig = {
  windowDurationMs: 24 * 60 * 60 * 1000,
  minimumIncomingAmount: "500000",
  minimumOutgoingTransactionCount: 3,
  minimumUniqueBeneficiaries: 2,
  minimumOutflowRatio: 80,
  currency: "PKR",
};

 export const dormantAccountConfig: DormantAccountRuleConfig = {
  dormancyPeriodMs: 90 * 24 * 60 * 60 * 1000,
  minimumReactivationAmount: "500000",
  currency: "PKR",
};
