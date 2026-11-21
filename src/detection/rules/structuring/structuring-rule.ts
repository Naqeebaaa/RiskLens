import type { AMLRule } from "../../engine/rule-interface.js";
import type { StructuringRuleConfig } from "./structuring-rule-config.js";
import type { RuleContext } from "../../types/rule-context.js";
import type { RuleFinding } from "../../types/findings.js";
import { Decimal } from "decimal.js";
//evaluate() kiya karta hai?: 
//Configuration aur transaction data are 2 diff thingds
//Configuration is the setting of rule //RuleContext is the actual transaction data
//evaluate() uses both  to examine detection transaction against rule's settings to return findings
//Dono class ke andar available hain, lekin different sources se aate hain
//and to access them:
// this.config = constructor se aayi settings
 // context = evaluate() ko mila transaction data


export class StructuringRule implements AMLRule {
     readonly id = "structuring-threshold-avoidance";
  readonly name = "Structuring / Threshold Avoidance";
  readonly description =
    "Detects repeated outgoing transactions near the configured threshold.";
    constructor(private config: StructuringRuleConfig) {} //This is Contsructor to initialize the StructuringRule class with a configuration object (jisme rule ke settings hain).
    //config constructor ko milne wala object hai jisme rules ki settings/ Configurations hain
    //private config us object ko class ki property mein save karta hai
    evaluate(context: RuleContext): RuleFinding[] {
      //Agar monitored account current transaction ka sender nahi hai, toh Structuring Rule execute karne ki zaroorat nahi. Skip karo.
      //Ye guard isliye add kar rahe hain taake sender ki activity receiver ke against mistakenly evaluate na ho.
      if (context.transaction.sourceAccountId !== context.accountId) {
  return [];
}
        // This rule currently supports PKR only.
        if (context.transaction.currency !== "PKR") {
  return [];
}
        //detection logic
        const transactions = [  
            context.transaction,
...context.previousOutgoingTransactions
        ];
       
        const currentTimestamp = new Date(context.transaction.timestamp).getTime(); //context.transaction.timestamp means current transaction ka timestamp
        const windowStart = currentTimestamp - this.config.windowDurationMs;

        //Filtering: ab hamain transactions array se sirf wo transactions select karni hain jo:
        //windowStart ke equal ya baad hui hon
        //currrentTimestamp ke equal ya pehli hui hon

        const filtered = transactions.filter((transaction) =>  {
       const transactionTimestamp =  new Date(transaction.timestamp).getTime();

             return( 
                transaction.currency ==="PKR" &&
                transactionTimestamp >=  windowStart && 
                transactionTimestamp <= currentTimestamp
            );
                
        })
        const threshold = new Decimal(this.config.threshold);
        const minAmount = threshold.times(this.config.nearThresholdPercentage).dividedBy(100);
        const nearThresholdTransactions = filtered.filter((transaction) => {
            const transactionAmount = new Decimal(transaction.amount);

            return (transactionAmount.gte(minAmount) &&
             transactionAmount.lt(threshold)
            ); 
      
});
  if (
      nearThresholdTransactions.length <
      this.config.minimumTransactionCount
    ) {
      return [];
    }

    const totalAmount = nearThresholdTransactions.reduce(
      (total, transaction) =>
        total.plus(transaction.amount),
      new Decimal(0)
    );

   return [
    {
        ruleId: this.id,
        ruleName: this.name,
        description:
          `Detected ${nearThresholdTransactions.length} outgoing ` +
          `PKR transactions near the configured threshold within ` +
          `the rolling time window. Combined amount: PKR ${totalAmount.toFixed(2)}.`,
      },
   ];
}
}


// Incoming transaction context
// Current transaction + previous transactions
//           |                
// Rolling 24-hour filter
// Only relevant transactions within the window
//            |
// Near-threshold filter
// PKR 450,000 or more, but less than PKR 500,000
//             |
// Minimum count check
// Are there at least 3 qualifying transactions?
//      |                        |
// No                             // Yes
// Return empty findings          // Calculate total + return finding


// In simple words:

// RiskLens checks whether the same account has made at 
// least three outgoing PKR transactions, each individually 
// close to the configured threshold, within a rolling 24-hour
//  period. If yes, it generates an AML finding with the transaction 
//  count and combined amount.