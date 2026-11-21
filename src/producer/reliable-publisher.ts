import { randomUUID } from "node:crypto";
import { getChannel } from "../config/queue.js";
import type { Options } from "amqplib";

interface PublishMessageOptions {
  queue: string;
  content: Buffer;
  options?: Options.Publish;
}
const returnedMessages = new Map<string, string>();

let returnListenerAttached = false;

export async function publishMessage({
  queue,
  content,
  options = {},
}: PublishMessageOptions): Promise<void> {
  const channel = await getChannel();
  if (!returnListenerAttached) {
  channel.on("return", (message) => {
    const messageId = message.properties.messageId;

    if (typeof messageId === "string") {
      returnedMessages.set(
        messageId,
"Message returned by RabbitMQ: message could not be routed to a queue."      );
    }
  });

  returnListenerAttached = true;
}

  const messageId = randomUUID();

  let drainListener: (() => void) | undefined;

  let resolveConfirm!: () => void;
  let rejectConfirm!: (error: Error) => void;

  const confirmPromise = new Promise<void>((resolve, reject) => {
    resolveConfirm = resolve;
    rejectConfirm = reject;
  });
  try {
   const canContinue= channel.sendToQueue(
      queue,
      content,
      {
        ...options,
        messageId,
        mandatory: true, //This mandatory true gives an imp msg to RabbitMQ that if the msg cannot be routed to a queue, please return it back to the producer instead of discarding it.
      },
      (error) => {
        const returnedError = returnedMessages.get(messageId);
        returnedMessages.delete(messageId);

        if (error) {
          rejectConfirm(error);
          return;
        }

        if (returnedError) {
          rejectConfirm(new Error(returnedError));
          return;
        }

        resolveConfirm();
      }
    );
     let drainPromise = Promise.resolve();

    if (!canContinue) {
      console.log("Publisher buffer full. Waiting for drain...");

      drainPromise = new Promise<void>((resolve) => {
        drainListener = resolve;
        channel.once("drain", resolve);
      });
    }

    await Promise.all([confirmPromise, drainPromise]);

  } catch (error) {
 if (drainListener) {
      channel.removeListener("drain", drainListener);
    }

    throw error;
  }
 
}

// We introduced two independent waits:
// 1. confirmPromise: RabbitMQ confirms that it accepted the publication.
// 2. drainPromise: Node's writable buffer has recovered if it was full.
// Promise.all() waits for both before allowing the publisher function to finish.

// Tumhara publishMessage() already two important guarantees provide karta hai:
// 1. Publisher confirmation: RabbitMQ confirms ke message accept ho gaya.
// 2. Backpressure handling: Publisher buffer full ho toh drain event ka wait karta hai.
// Ye dono E2E test ke liye useful hain.