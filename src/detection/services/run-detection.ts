//Consumer ko clean rakhne ke liye detection orchestration alag service mein hogi.import type { Transaction } from "../../schemas/transaction.schema.js";
//is service ki responsibility hogi:
// 1. Relevant account IDs identify karna.
// 2. Har account ke liye buildRuleContext() call karna.
// 3. createRuleEngine() se engine lena.
// 4. Har context par ruleEngine.execute(context) chalana.
// 5. Findings collect karke return karna.

import type { Transaction } from "../../schemas/transaction.schema.js";
import type { DetectionFinding  } from "../types/findings.js";
import { buildRuleContext } from "./build-rule-context.js";
import { createRuleEngine } from "../engine/register-rules.js";

export async function runDetection(
    transaction: Transaction
): Promise<DetectionFinding[]> {

    const accountIds =  //accountIds ek array hai, taake hum baad mein loop chala kar har account ka separate context build kar sakein.
    //avaScript ka Ternary Operator
  transaction.transactionType  === "CASH_DEPOSIT"  // if current transaction is cash deposit then destination account array is made only  Kyunke cash deposit mein source "CASH-EXTERNAL" hai, jo actual customer account nahi hai.
   ? [transaction.destinationAccountId]
    : [  //agar false hua to dono customer accounts ki array bane gi
        transaction.sourceAccountId,
        transaction.destinationAccountId,
        //Hamare Zod schema mein sirf do transaction types allowed hain:
//z.enum(["TRANSFER", "CASH_DEPOSIT"])
//Isliye CASH_DEPOSIT nahi hai toh transaction TRANSFER hi hoga.
    ];

    const ruleEngine = createRuleEngine();
const findings: DetectionFinding[] = [];

for (const accountId of accountIds) {
  // Har account par operation perform hoga
//   Humein accountIds ke har account ke liye:
// 1. buildRuleContext() call karna hai.
// 2. ruleEngine.execute() chalana hai.
// 3. Results ko findings array mein collect karna hai.


//below line recieves complete RuleContext object
const context = await buildRuleContext(transaction, accountId);

//below line execute all 4 registered AML rules on current account context and return findings
//accountFindings = sirf current account ki findings.
//findings = sab accounts ki combined findings.
const accountFindings = ruleEngine.execute(context);
findings.push(...accountFindings.map((finding ) => ({
    ...finding,
    accountId,
   transactionId: transaction.id,
}))
);
//findings = [...] → new array assign karne ki koshish.
//findings.push(...) → existing array mein new findings add karna.
}
return findings;
}
