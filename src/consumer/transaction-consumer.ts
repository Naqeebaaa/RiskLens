
import { env } from "../config/env.js";
import { randomUUID } from "node:crypto";
import { getConsumerChannel, setupRetryInfrastructure, } from "../config/queue.js";
import {
  isTransactionProcessed,
  claimTransaction,
  markTransactionProcessed,
  releaseTransactionClaim,
} from "../services/idempotency.js";
import {
  transactionSchema,
  type Transaction,
} from "../schemas/transaction.schema.js";
import { storeTransaction } from "../services/transaction-storage.js";
import { publishRetry, publishToDLQ, } from "../producer/retry-publisher.js";
import { runDetection } from "../detection/services/run-detection.js";


async function processTransaction(transaction: Transaction) {
  console.log("Processing transaction:", transaction);
  if (env.SIMULATE_PROCESSING_FAILURE) {
    throw new Error("Simulated processing failure");
  }
  const findings = await runDetection(transaction);
  console.log("Detection findings:", findings);
  return findings;
}

//Promise<string> means this async function will eventually give us a string — the RabbitMQ consumer tag
//RabbitMQ's channel.consume() returns a consumer result containing consumerTag.
//consumerTag is a string that identifies this particular consumer. e.g "amq.ctag-abc123"
//We need this ID later to stop the consumer -> await channel.cancel(consumerTag);

export async function startTransactionConsumer(): Promise<string> {
  const channel = await getConsumerChannel();

await setupRetryInfrastructure(channel);
 //the purpose of this line: Consumer start hone se pehle RabbitMQ mein retry aur DLQ queues ensure karna.
    const result = await channel.consume(
      "transactions",                            //Ab RabbitMQ startup par dono queues declare ho jayengi:
                                                 //transactions.retry
      async (message) => {                     //- transactions.dlq

      if (!message) return;// if no msg from RabbitMQ, nothing to process, return early.

      //creating variables
      let transaction: Transaction | undefined;  // validated transaction stores here
      let validationError: unknown; //Agar JSON parsing ya validation fail hui toh error yahan store hoga.

      // Step 1: Parse and validate incoming message(two operations taking place here)
      try {
        const raw: unknown = JSON.parse(  //1.RabbitMQ message ke Buffer ko string mein convert karke JSON parse karte hain.
          message.content.toString()
        );

        const validation = transactionSchema.safeParse(raw); //2. Zod schema check karta hai ke transaction ke fields expected format mein hain ya nahi.
        //safeParse() ka benefit ye hai ke validation fail hone par exception throw nahi hoti. Instead, result mein success: false milta hai.
        if (validation.success) {
          transaction = validation.data; //if data is valid then actual validated data stores in transaction
        } else {
          validationError = validation.error; //if invalid, then error details stores in validationError variable
        }
      } catch (error) {
        validationError = error;
      }

      // Step 2: Route invalid messages directly to DLQ
      if (!transaction) {
        console.error("Poison message rejected:", validationError);

        try {
          await publishToDLQ(message, 0);
          channel.ack(message);    //DLQ publishing successful → ACK original message.
          console.log("Invalid transaction sent to DLQ.");
        } catch (publishError) {
          console.error("Failed to publish poison message:", publishError); //- DLQ publishing failed → NACK + requeue.
          channel.nack(message, false, true);
        }

        return;
      }

      let claimToken: string | null = null;

      try {
        const parsedTransaction = transaction;


        //Step 1: Check if already processed
        const alreadyProcessed =
          await isTransactionProcessed(parsedTransaction.id);

        if (alreadyProcessed) {
          console.log(
            `Duplicate skipped: ${parsedTransaction.id}`
          );

          // Acknowledge only after successful processing.
          channel.ack(message);
          return;
        }
        //Step 2: Generate a unique token for this attempt
        claimToken = randomUUID();
        //Step 3 : Try to claim the transaction.
        const claimed = await claimTransaction(
          parsedTransaction.id,
          claimToken
        );
        if (!claimed) {
          console.log(`Transaction already claimed: ${parsedTransaction.id}`);
          channel.nack(message, false, true);
          return;
        }
        // Step 4: Process the transaction
        await processTransaction(parsedTransaction);

        // Step 5: Persist transaction in PostgreSQL
        await storeTransaction(parsedTransaction);

        // Step 6: Mark it as successfully processed in Redis
        await markTransactionProcessed(parsedTransaction.id);
        await releaseTransactionClaim(
          parsedTransaction.id,
          claimToken
        );

        //Step 6: Acknowledge RabbitMQ.
        channel.ack(message);
        console.log(`Transaction acknowledged: ${parsedTransaction.id}`);

      } catch (error) {
        console.error("Transaction processing failed:", error);

        if (claimToken && transaction) {
          try {
            await releaseTransactionClaim(
              transaction.id,
              claimToken
            );
          } catch (releaseError) {
            console.error(
              "Failed to release transaction claim:",
              releaseError
            );
          }
        }

        try {
          const retryCount = Number(message.properties.headers?.["x-retry-count"] ?? 0);
          if (!Number.isInteger(retryCount) || retryCount < 0) {
            throw new Error("Invalid retry count!");
          }
          if (retryCount < 2) {
            await publishRetry(message, retryCount + 1);
          } else {
            await publishToDLQ(message, retryCount);
          }
          // Acknowledge  original only after successful publishing to retry or DLQ queue.
          channel.ack(message);
        } catch (publishError) {
          console.error("Failed to publish to retry/DLQ message:", publishError);
          // Original message remains eligible for redelivery.
          channel.nack(message, false, true);
        }
      }
    },
      { noAck: false}
    );
      console.log("RiskLens transaction consumer is listening...");
      return result.consumerTag;
}
