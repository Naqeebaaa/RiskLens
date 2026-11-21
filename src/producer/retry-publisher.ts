import type { ConsumeMessage } from "amqplib";
import { publishMessage } from "./reliable-publisher.js";

// Logic:
// 1. Agar message pehle retry ho chuka hai, toh existing x-original-message-id use hoga.
// 2. Agar first retry hai, toh current messageId original ID ban jayega.
// 3. Agar ID available nahi, toh undefined return hoga.
// Is tarah retry chain mein original identity preserve rahegi, jabke har new publication ka apna unique messageId hoga.
function getOriginalMessageId(
    message: ConsumeMessage
): string | undefined {
    const originalId =
        message.properties.headers?.["x-original-message-id"];

    if (typeof originalId === "string") {
        return originalId;
    }

    const currentId = message.properties.messageId;

    if (typeof currentId === "string") {
        return currentId;
    }

    return undefined;
}


//ConsumeMessage is a type provided by amqplib
// - Transaction = the actual transaction's data.
// - ConsumeMessage = the envelope/package containing that data plus RabbitMQ metadata.
// Our retry publisher needs that envelope because we want to preserve the original message and update its retry count.
export async function publishRetry(
    message: ConsumeMessage,
    retryCount: number
): Promise<void> {
    const originalMessageId = getOriginalMessageId(message);
    await publishMessage({
        queue: "transactions-retry",
        content: message.content,
        options: {
            timestamp: message.properties.timestamp,
            persistent: true,//Tells RabbitMQ to mark this message as persistent, so it can survive a broker restart (assuming the queue is durable too).
            contentType: message.properties.contentType, //Preserves the original message's content type, such as application/json.
            headers: {
                ...message.properties.headers,
                "x-retry-count": retryCount,
                ...(originalMessageId && {     //Reason: Conditional spread ki wajah se header sirf tab add hoga jab actual ID available ho.
                    "x-original-message-id": originalMessageId,
                }),
            },
        },
    });

}

export async function publishToDLQ(
    message: ConsumeMessage,
    retryCount: number
): Promise<void> {
    const originalMessageId = getOriginalMessageId(message);
    await publishMessage({

        queue: "transactions-dlq",// Stores transactions that have exhausted their allowed processing attempts.
        content: message.content,  //This is the actual message body — our original transaction data in Buffer format.
        options: {
            timestamp: message.properties.timestamp,
            persistent: true,
            contentType: message.properties.contentType,

            headers: {
                ...message.properties.headers,
                "x-retry-count": retryCount,
                ...(originalMessageId && {   ///Reason: Conditional spread ki wajah se header sirf tab add hoga jab actual ID available ho.
                    "x-original-message-id": originalMessageId,
                }),
            },
        },
    });

    console.log("Message successfully published to DLQ");
}