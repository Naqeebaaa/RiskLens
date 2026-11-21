import { describe, it, expect } from "vitest";
import { transactionSchema } from "./transaction.schema.js";

const validTx = {
  id: "txn_test_001",
  sourceAccountId: "acc_101",
  destinationAccountId: "acc_202",
  amount: "9500.00",
  currency: "USD",
  timestamp: "2026-11-12T10:00:00.000Z",
};

describe("Transaction amount validation", () => {
  it.each([
    "9500.00",
    "0.01",
    "999999999999999999.99",
  ])("accepts valid amount: %s", (amount) => {
    const result = transactionSchema.safeParse({
      ...validTx,
      amount,
    });

    expect(result.success).toBe(true);
  });

  it.each([
    "0.00",
    "-5.00",
    "abc",
    "95.123",
    "1000000000000000000.00",
  ])("rejects invalid amount: %s", (amount) => {
    const result = transactionSchema.safeParse({
      ...validTx,
      amount,
    });

    expect(result.success).toBe(false);
  });
});