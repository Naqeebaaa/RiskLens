import type { AMLRule } from "../../engine/rule-interface.js";
import type { DormantAccountRuleConfig } from "./dormant-account-config.js";
import type { RuleContext } from "../../types/rule-context.js";
import type { RuleFinding } from "../../types/findings.js";
import { Decimal } from "decimal.js";

export class DormantAccountRule implements AMLRule {
  readonly id = "dormant-account-reactivation";
  readonly name = "Dormant Account Reactivation";
  readonly description =
    "Detects significant transactions from or into previously inactive accounts.";

  constructor(private config: DormantAccountRuleConfig) {}

  evaluate(context: RuleContext): RuleFinding[] {
if (
  context.transaction.sourceAccountId !== context.accountId &&
  context.transaction.destinationAccountId !== context.accountId
) {
  return [];
}
if (context.previousAccountActivity.length > 0) { //to find out if there were transactions in 
  return []; //previous 90 days
}


//now current transaction ki currency aur amount validate karenge.
if (
  context.transaction.currency !== this.config.currency ||  //Currency PKR nahi hai → no finding.
  new Decimal(context.transaction.amount).lt(          //Amount PKR 500,000 se kam hai → no finding.
    this.config.minimumReactivationAmount          //Amount exactly PKR 500,000 hai → eligible.
  )                                               //- Amount 500,000 se zyada hai → eligible.
) {
  return [];
}

return [
  {
    ruleId: this.id,
    ruleName: this.name,
    description:
      `Detected a significant ${context.transaction.transactionType} ` +
      `of ${context.transaction.amount} ${this.config.currency} ` +
      `in a previously dormant account (${context.accountId}).`
  }
];

  }
}