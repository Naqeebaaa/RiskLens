
import { pool } from "../config/database.js";
import type { Transaction } from "../schemas/transaction.schema.js";


export async function storeTransaction(
  transaction: Transaction
): Promise<boolean> {
  const result = await pool.query(
    `INSERT INTO transactions (
      id,
      source_account_id,
      destination_account_id,
      amount,
      currency,
      occurred_at,
      transaction_type,
location_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (id) DO NOTHING`,
    [
      transaction.id,
      transaction.sourceAccountId,
      transaction.destinationAccountId,
      transaction.amount,
      transaction.currency,
      transaction.timestamp,
      transaction.transactionType,
      transaction.locationId ?? null,
    ]
  );

  return result.rowCount === 1;
}
