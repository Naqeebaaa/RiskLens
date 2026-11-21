import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { connection } from "../config/rabbitmq.js";
import { publishTransaction } from "../producer/transaction-producer.js";
import { startTransactionConsumer } from "./transaction-consumer.js";

import { getConsumerChannel } from "../config/queue.js";
import { pool } from "../config/database.js";
import { redis } from "../config/redis.js";

import type { Transaction } from "../schemas/transaction.schema.js";

let consumerTag: string;


const transactionId = `e2e-${randomUUID()}`;

const testTransaction: Transaction = {
  id: transactionId,
  sourceAccountId: "acc_e2e_source",
  destinationAccountId: "acc_e2e_destination",
  amount: "9500.00",
  currency: "USD",
  timestamp: new Date().toISOString(),
  transactionType: "TRANSFER",
};
async function waitForTransaction(transactionId: string) {
  return await expect.poll(
    async () => {
      const result = await pool.query(
        `SELECT id, amount::text AS amount
         FROM transactions
         WHERE id = $1`,
        [transactionId]
      );

      return result.rows[0] ?? null;
    },
    {
      timeout: 10_000,
      interval: 200,
    }
  ).toEqual({
    id: transactionId,
    amount: "9500.00",
  });
}
describe("Transaction consumer E2E", () => {
  beforeAll(async () => {
    consumerTag = await startTransactionConsumer();
  });

  it("publishes a transaction and persists it in PostgreSQL", async () => {
    await publishTransaction(testTransaction);
    await waitForTransaction(transactionId);
  });

  afterAll(async () => {
    const channel = await getConsumerChannel();

    await channel.cancel(consumerTag);

    await pool.query(
      "DELETE FROM transactions WHERE id = $1",
      [transactionId]
    );

    await redis.del(
      `processing:${transactionId}`,
      `processed:${transactionId}`
    );
    await connection.close();
await pool.end();
await redis.quit();
  });
});

// This E2E test ensures that the transaction consumer correctly processes a published transaction and persists it in PostgreSQL. It also cleans up the database and Redis after the test.
// teardown sequence will now be:
// 1. Cancel the consumer.
// 2. Delete the test transaction from PostgreSQL.
// 3. Delete its Redis idempotency keys.
// 4. Close RabbitMQ connection and its channels.
// 5. Close PostgreSQL pool.
// 6. Close Redis connection.

//Why close all three?
//These are independent connections. Closing RabbitMQ doesn't automatically close PostgreSQL or Redis