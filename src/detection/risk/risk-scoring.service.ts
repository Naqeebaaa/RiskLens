import type { RiskLevel, AccountRisk } from "./risk-score.types.js";
import type { DetectionFinding } from "../types/findings.js";
// interface → TypeScript ko batata hai object ka structure kya hona chahiye.
// const object → actual values memory mein store karta hai, jinhein scoring function use karega.

const ruleWeights: Record<string, number> = {
  "structuring-threshold-avoidance": 30,
  "temporal-spatial-smurfing": 35,
  "rapid-pass-through-fund-movement": 40,
  "dormant-account-reactivation": 20

};

//risk scoring accountId ke basis par hogi, individual finding ke basis par nahi.
//if acc_101 have 3 findings: structuring, smurfing, dormant : 30+35+20 = 85= Critical
// acc_202 have 2 findings structuring , rapid pass thru: 30+40= 70 High
export function calculateRiskScores(
  findings: DetectionFinding[]
): AccountRisk[]  {
  //hamain dynamically multiple account IDs ke against findings store karni hi
    const findingsByAccount = new Map<string, DetectionFinding[]>();
    const accountRisks: AccountRisk[] = [];
    for (const finding of findings) {
      //checking if entry of that accounntId is already present in Map
      //if yes -> adding the finding in existing array
      //if not then create new array for that account
  const accountFindings = findingsByAccount.get(finding.accountId);

  if (accountFindings) {
    accountFindings.push(finding);
  } else {
    findingsByAccount.set(finding.accountId, [finding]);
  }
}
//now after map we need an array in which we can store calculated risks which we declared above(accountRisks)
//aacountRisks stores calculated results(risks
// Ab findingsByAccount Map ko iterate karna hai. 
// JavaScript Map mein .entries() har iteration mein key aur value dono deta hai.
for(const [accountId, accountFindings] of findingsByAccount.entries()){
  let score = 0;

const firstFinding = accountFindings[0];
if (!firstFinding) {
  continue;
}

//processedRules ka matlab hai: is account ke kaun se rules already score mein count ho chuke hain.
//Using Set taa ke koi rule 2 bar add na hojae(duplicate)
  //its correct placement is above inner loop 
  //bc every account should have it sseparate Set
  const processedRules = new Set<string>();

  for (const finding of accountFindings) {
    if (processedRules.has(finding.ruleId)) {
    continue;
  }
    const weight = ruleWeights[finding.ruleId];

  if (weight === undefined) {
    continue;
    // continue ka matlab: agar current finding ka weight nahi mila, 
    // toh is iteration ko skip karke next finding par chale jao.
  }
   processedRules.add(finding.ruleId);
    score += weight;
  }
  const finalScore = Math.min(score, 100);
  let riskLevel: RiskLevel;
  if(finalScore === 0){
   riskLevel ="NO_RISK";
  } else if (finalScore < 30) {
  riskLevel = "LOW";
} else if (finalScore < 60) {
  riskLevel = "MEDIUM";
} else if (finalScore < 80) {
  riskLevel = "HIGH";
} else {
  riskLevel = "CRITICAL";
}
accountRisks.push({
  accountId,
transactionId: firstFinding.transactionId,  riskScore: finalScore,
  riskLevel,
triggeredRules: [...processedRules],
});
}
return accountRisks;
}