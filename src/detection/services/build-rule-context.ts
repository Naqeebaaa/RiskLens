import type { Transaction } from "../../schemas/transaction.schema.js";
import type { RuleContext } from "../types/rule-context.js";
import { getPreviousTransactions } from "./transaction-history.js";

// Ye function:
// 1. Current transaction receive karega.
// 2. accountId receive karega.
// 3. Required historical transactions PostgreSQL se fetch karega.
// 4. RuleContext object return karega.
export async function buildRuleContext(
  transaction: Transaction,
  accountId: string
): Promise<RuleContext> {

    //Ab function ke andar pehle current transaction ka timestamp use karke history boundaries calculate karenge.
    const transactionTime = new Date(transaction.timestamp).getTime();

const outgoingSince = new Date(
  transactionTime - 24 * 60 * 60 * 1000
).toISOString();

const cashDepositsSince = new Date(
  transactionTime - 4 * 60 * 60 * 1000
).toISOString();

const incomingSince = outgoingSince;

const accountActivitySince = new Date(
  transactionTime - 90 * 24 * 60 * 60 * 1000
).toISOString();

const before = transaction.timestamp;

//fetching four history queries from db so that  4 queries execute parallel and not one by one
const [
  previousOutgoingTransactions,
  previousCashDeposits,
  previousIncomingTransactions,
  previousAccountActivity,
] = await Promise.all([
  getPreviousTransactions(accountId, before, outgoingSince, "OUTGOING"),
  getPreviousTransactions(accountId, before, cashDepositsSince, "CASH_DEPOSITS"),
  getPreviousTransactions(accountId, before, incomingSince, "INCOMING"),
  getPreviousTransactions(accountId, before, accountActivitySince, "ACCOUNT_ACTIVITY"),
  //Ye chaar independent database queries hain. Inhein sequentially await karne ke bajaye
  //  parallel execute karna faster hai. Agar koi query fail ho, Promise.all() reject ho jayega.
]);
//returning fetched histories in RuleContext object
return {
  accountId,
  transaction,
  previousOutgoingTransactions,
  previousIncomingTransactions,
  previousCashDeposits,
  previousAccountActivity,
};
}