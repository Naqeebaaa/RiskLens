import { describe, it, expect } from "vitest";
import { calculateRiskScores } from "./risk-scoring.service.js";
import type { DetectionFinding } from "../types/findings.js";

describe("Risk Scoring Service", () => {
  it("should calculate risk scores separately for each account", () => {
    const findings: DetectionFinding[] = [
  // Account 101
  {
    ruleId: "structuring-threshold-avoidance",
    ruleName: "Structuring",
    description: "Repeated transactions near threshold",
    accountId: "acc_101",
    transactionId: "txn_101",
  },
  {
    ruleId: "temporal-spatial-smurfing",
    ruleName: "Smurfing",
    description: "Deposits across multiple locations",
    accountId: "acc_101",
    transactionId: "txn_101",
  },
  {
    ruleId: "dormant-account-reactivation",
    ruleName: "Dormant Account Reactivation",
    description: "Significant transaction after dormancy",
    accountId: "acc_101",
    transactionId: "txn_101",
  },

  // Account 202
  {
    ruleId: "structuring-threshold-avoidance",
    ruleName: "Structuring",
    description: "Repeated transactions near threshold",
    accountId: "acc_202",
    transactionId: "txn_202",
  },
  {
    ruleId: "rapid-pass-through-fund-movement",
    ruleName: "Rapid Pass-through",
    description: "Rapid movement of incoming funds",
    accountId: "acc_202",
    transactionId: "txn_202",
  },
];
  const result = calculateRiskScores(findings);
expect(result).toHaveLength(2);

const account101 = result.find(
  (risk) => risk.accountId === "acc_101"
);

const account202 = result.find(
  (risk) => risk.accountId === "acc_202"
);

expect(account101?.riskScore).toBe(85);
expect(account101?.riskLevel).toBe("CRITICAL");

expect(account202?.riskScore).toBe(70);
expect(account202?.riskLevel).toBe("HIGH");
  });
});