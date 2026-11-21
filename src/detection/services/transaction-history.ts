//The responsibility of this file is to retrieve previous transactions of the account from the PostgreSQL

import { pool } from "../../config/database.js";
import type { Transaction } from "../../schemas/transaction.schema.js";
import { transactionSchema } from "../../schemas/transaction.schema.js";

type TransactionScope = "OUTGOING" | "CASH_DEPOSITS" | "INCOMING" | "ACCOUNT_ACTIVITY";; // The function supports four transaction history scopes.

export async function getPreviousTransactions(
  accountId: string, //jis account ki history retrieve karni hai
  before: string,  //Sirf woh transactions retrieve karo jinka timestamp current transaction ke timestamp se pehle hai.
  since: string, // kitni purani history chahiye, since it isin efficient to retrieve unlimited history in large financial systems
  scope: TransactionScope
): Promise<Transaction[]> {  //Database query asynchronous hogi aur matching transactions return karegi.
  const accountFilter =

   scope === "OUTGOING" // yahan scope ke according condition select karo
  ? `source_account_id = $1  AND transaction_type = 'TRANSFER'` 
  
  : scope ==="ACCOUNT_ACTIVITY"
    ? `(source_account_id = $1  OR destination_account_id = $1)` //account ki incoming aur outgoing
    // dono types ki transactions retrieve hongi, including TRANSFER and CASH_DEPOSIT.

  : scope === "CASH_DEPOSITS"
  ? `destination_account_id = $1 AND transaction_type = 'CASH_DEPOSIT'`

  //Ye last line INCOMING scope ke liye hai.
  //TRANSFER: KISI or account se aye // Cash DepoSIT: kahin bahar se CASH-EXTERNAL aya 
      : `destination_account_id = $1 AND transaction_type IN ('TRANSFER', 'CASH_DEPOSIT')`;
  const result = await pool.query(
    `SELECT
     id,
     source_account_id AS "sourceAccountId",
     destination_account_id AS "destinationAccountId",
     amount,
     currency,
     transaction_type AS "transactionType",
     location_id AS "locationId",
     occurred_at AS timestamp
   FROM transactions
WHERE ${accountFilter}
AND occurred_at >= $3
AND occurred_at < $2
   ORDER BY occurred_at DESC`,
    [accountId, before, since]
  );
  const rows = result.rows.map((row) => ({
    ...row,
        locationId: row.locationId ?? undefined, //row.locationId ?? undefined: agar database se null aaye toh undefined bana do.
    timestamp:
      row.timestamp instanceof Date
        ? row.timestamp.toISOString()
        : row.timestamp,
  }));

  return transactionSchema.array().parse(rows);//return result.rows; //database se retrieved records.
}

//different AML rules need different observation windows.

// For example:
// - Structuring: potentially 24 hours.
// - Transaction velocity: potentially 1 hour.
// - Dormant account reactivation: potentially 90 days or longer.
// therefore service  fetch transactions using a configurable historical time window

