import type { AMLRule } from "../../engine/rule-interface.js";
import type { SmurfingRuleConfig } from "./smurfing-rule-config.js";
import type { RuleContext } from "../../types/rule-context.js";
import type { RuleFinding } from "../../types/findings.js";


export class SmurfingRule implements AMLRule{
 readonly id = "temporal-spatial-smurfing";
readonly name = "Temporal & Spatial Smurfing";
readonly description =
  "Detects repeated cash deposits across multiple locations within a rolling time window.";
 constructor(private config: SmurfingRuleConfig) {}
 evaluate (context: RuleContext): RuleFinding[]{
  if (context.transaction.transactionType !== "CASH_DEPOSIT") {
  return [];
}

if (context.transaction.destinationAccountId !== context.accountId) {
  return [];
}

const transactions = [       //ab hamaare pass: 1. Current cash deposit
    context.transaction,     //2. Previous cash deposits from the same account 
    ...context.previousCashDeposits // dono aik array main availabale hain
];

 
        const currentTimestamp = new Date(context.transaction.timestamp).getTime(); //context.transaction.timestamp means current transaction ka timestamp
        const windowStart = currentTimestamp - this.config.windowDurationMs;

        const filtered = transactions.filter((transaction) => {
        const transactionTimestamp =  new Date(transaction.timestamp).getTime();

          return( 
                transaction.currency ===this.config.currency &&
                transactionTimestamp >=  windowStart && 
                transactionTimestamp <= currentTimestamp &&
                transaction.transactionType === "CASH_DEPOSIT"
            );
        });
//         Assume filtered mein 4 transactions hain:
//           Transaction	locationId
//              T1	         ATM-01
//              T2	         ATM-02
// 	            T3           Branch-01
//              T4	         ATM-01
        //Filter woh transactions return karta hai jinmein locationId available hai
         const validLocations =  filtered.filter((transaction) => 
            transaction.locationId
         );
        
         
         //Extract locations IDs:
        //  yahan map() ne transaction objects se sirf location IDs extract ki hain.
        // Result:["ATM-01", "ATM-02", "Branch-01", "ATM-01"]
         const locationIds= validLocations.map(
            (transaction) => transaction.locationId
         );  //Notice: Ab transaction objects nahi hain, sirf location IDs hain.
         
         
         //Remove duplicates
         const locations = new Set(locationIds); //JavaScript ka Set unique values store karta hai. Duplicate values automatically remove ho jati hain.
         //Before Set ATM-01, ATM-02, Branch-01, ATM-01 -> After Set ->Unique locations ATM-01, ATM-02, Branch-01

         if (
  validLocations.length < this.config.minimumTransactionCount ||
  locations.size < this.config.minimumUniqueLocations
) {
  return [];
//   Deposits with location	 Unique locations	  Result
//  3	                      3                   No finding
//   4		                  2                   No finding
// 4		                  3                    Detection qualifies
// 5		                  4                      Detection qualifies
 }

 return [
    {
      ruleId: this.id,
        ruleName: this.name,
        description:
        `Detected ${validLocations.length} cash deposits across ` +
        `${locations.size} unique locations within the rolling time window.`
    }
 ];
 }
}    