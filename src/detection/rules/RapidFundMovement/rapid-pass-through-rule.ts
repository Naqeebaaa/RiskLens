import type { AMLRule } from "../../engine/rule-interface.js";
import type { RapidPassThroughRuleConfig } from "./rapid-pass-through-config.js";
import type { RuleContext } from "../../types/rule-context.js";
import type { RuleFinding } from "../../types/findings.js";
import { Decimal } from "decimal.js";


export class RapidPassThroughRule implements AMLRule {
  readonly id = "rapid-pass-through-fund-movement";
  readonly name = "Rapid Pass-Through / Mule Activity";
  readonly description =
    "Detects rapid movement of significant incoming funds to multiple beneficiaries.";
  constructor(private config: RapidPassThroughRuleConfig) { }
  evaluate(context: RuleContext): RuleFinding[] {
    if (
      context.transaction.transactionType !== "TRANSFER" ||
      context.transaction.sourceAccountId !== context.accountId
    ) {
      return [];
    }
    const incomingTransactions = [
      ...context.previousIncomingTransactions
    ];

    const outgoingTransactions = [
      ...context.previousOutgoingTransactions,
      context.transaction
    ];
    const currentTimestamp = new Date(
      context.transaction.timestamp
    ).getTime();
    //incomingTransactions mein current transaction add nahi hogi, kyun ke current transaction outgoing hai.
    //outgoingTransactions mein current transaction add hogi, taake current event bhi calculation mein count ho.

    const windowStart =
      currentTimestamp - this.config.windowDurationMs;

    const filteredIncomingTransactions = incomingTransactions.filter((transaction) => {
      const transactionTimestamp = new Date(
        transaction.timestamp).getTime();
      
      return (
        transaction.currency === this.config.currency &&
        transactionTimestamp >= windowStart &&
        transactionTimestamp <= currentTimestamp

    )
    });

    const filteredOutgoingTransactions = outgoingTransactions.filter(
        (transaction) => {
    const transactionTimestamp = new Date(
      transaction.timestamp
    ).getTime();
       return (
      transaction.currency === this.config.currency &&
      transactionTimestamp >= windowStart &&
      transactionTimestamp <= currentTimestamp
    );
    })
    const totalIncomingAmount = filteredIncomingTransactions.reduce(
      (total, transaction) => {
        return total.plus(new Decimal(transaction.amount));
      },
      new Decimal(0)
    );

if (
  filteredIncomingTransactions.length === 0 ||
  totalIncomingAmount.lt(this.config.minimumIncomingAmount)
) {
  return [];      
//   Example:
// - Incoming = 400,000 → rule stop.
// - Incoming = 650,000 → rule continues.
}

// iske baad hum ek important temporal condition add karenge: outgoing transfers relevant incoming funds receive hone ke baad hi count hon. 
// Yeh false positives reduce karne ke liye zaroori hai.

const earliestIncomingTimestamp = Math.min(
  ...filteredIncomingTransactions.map((transaction) =>
    new Date(transaction.timestamp).getTime()
  )
);  //Iska result earliest incoming transaction ka timestamp hoga.

//ab hum outgoing transactions ko filter karenge taake sirf incoming
//  funds receive hone ke baad wali transactions count hon.
const relevantOutgoingTransactions = filteredOutgoingTransactions.filter(
  (transaction) => {
    const transactionTimestamp = new Date(
      transaction.timestamp
    ).getTime();

    return transactionTimestamp >= earliestIncomingTimestamp;
  }
);



const totalOutgoingAmount = relevantOutgoingTransactions.reduce(
  (total, transaction) => {
    return total.plus(new Decimal(transaction.amount));
  },
  new Decimal(0)
);

const outgoingTransactionCount = relevantOutgoingTransactions.length;
if (
  outgoingTransactionCount <
  this.config.minimumOutgoingTransactionCount
) {
  return [];
}

// Next step: Unique beneficiaries calculate karna
// Rapid pass-through pattern mein sirf multiple outgoing transactions enough nahi.
//  Humein dekhna hai ke paisay kitne different accounts ko bheje gaye.
   
    const uniqueBeneficiaries = new Set(
      relevantOutgoingTransactions.map((transaction)=> 
        transaction.destinationAccountId)
    );

    if (
  uniqueBeneficiaries.size <
  this.config.minimumUniqueBeneficiaries
) {
  return [];
}

// t: Outflow ratio calculate karna
// Formula: {Outflow Ratio} = {Total Outgoing}/{Total Incoming}}x 100
// Example:
// - Total incoming = PKR 600,000
// - Total outgoing = PKR 510,000
// - Outflow ratio = 85%

const outflowRatio = totalOutgoingAmount
  .dividedBy(totalIncomingAmount)
  .times(100);

  if (outflowRatio.lt(this.config.minimumOutflowRatio)) {
  return [];
}



return [
  {
    ruleId: this.id,
    ruleName: this.name,
    description:
      `Detected account-level rapid pass-through activity correlation ` +
      `${totalIncomingAmount.toFixed(2)} ${this.config.currency} received, ` +
      `${totalOutgoingAmount.toFixed(2)} ${this.config.currency} transferred ` +
      `to ${uniqueBeneficiaries.size} unique beneficiaries through ` +
      `${outgoingTransactionCount} transactions. ` +
      `Outflow ratio: ${outflowRatio.toFixed(2)}%.`
  }
];
  }
}