
import { publishMessage } from "./reliable-publisher.js";
import type { Transaction } from "../schemas/transaction.schema.js";

export async function publishTransaction(
  transaction: Transaction //Function transaction create nahi karti; ye already-created transaction receive karke publish karti hai
): Promise<void> {
 const message = Buffer.from(JSON.stringify(transaction));

await publishMessage({
  queue: "transactions",
  content: message,
  options: {
    persistent: true,
    contentType: "application/json",
    timestamp: Date.now(),
  },
});

console.log(`Transaction published: ${transaction.id}`);
}
