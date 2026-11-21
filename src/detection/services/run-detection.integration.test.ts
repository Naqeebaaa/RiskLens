
import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";

import { pool } from "../../config/database.js";
import { runDetection } from "./run-detection.js";
import type { Transaction } from "../../schemas/transaction.schema.js";

describe("AML detection integration", () => {
  it("detects smurfing using real PostgreSQL transaction history", async () => {
    const uniqueId = randomUUID();
    const accountId = `acc-smurfing-test-${uniqueId}`;

    const currentTime = new Date();

    const previousTransactions: Transaction[] = [90, 60, 30].map(
      (minutes, index) => ({
        id: `smurfing-test-${uniqueId}-${index}`,
        sourceAccountId: "CASH-EXTERNAL",
        destinationAccountId: accountId,
        amount: "10000.00",
        currency: "PKR",
        timestamp: new Date(
          currentTime.getTime() - minutes * 60 * 1000
        ).toISOString(),
        transactionType: "CASH_DEPOSIT",
        locationId: `ATM-${index + 1}`,
      })
    );

    const currentTransaction: Transaction = {
      id: `smurfing-current-${uniqueId}`,
      sourceAccountId: "CASH-EXTERNAL",
      destinationAccountId: accountId,
      amount: "10000.00",
      currency: "PKR",
      timestamp: currentTime.toISOString(),
      transactionType: "CASH_DEPOSIT",
      locationId: "ATM-04",
    };

    const testTransactionIds = previousTransactions.map(
      (transaction) => transaction.id
    );

    try {
      for (const transaction of previousTransactions) {
        await pool.query(
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
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            transaction.id,
            transaction.sourceAccountId,
            transaction.destinationAccountId,
            transaction.amount,
            transaction.currency,
            transaction.timestamp,
            transaction.transactionType,
            transaction.locationId,
          ]
        );
      }

      const findings = await runDetection(currentTransaction);

      expect(findings).toHaveLength(1);
    } finally {
      await pool.query(
        `DELETE FROM transactions WHERE id = ANY($1::text[])`,
        [testTransactionIds]
      );
    }
  });
});
