import { connection } from "./rabbitmq.js";
import type { ConfirmChannel } from "amqplib";
import type { Channel } from "amqplib";


let channel: ConfirmChannel | null = null; //currently either a real channel or nothing.
let channelPromise: Promise<ConfirmChannel> | null = null;    //either an ongoing initialization that will produce a channel, or nothing.

let consumerChannel: Channel | null = null;
let consumerChannelPromise: Promise<Channel> | null = null;

connection.on("close", () => {
    channel = null;
    channelPromise = null;

    consumerChannel = null;
    consumerChannelPromise = null;

    console.log("RabbitMQ connection closed. Channel references cleared.");
});

export async function createChannel() {

    const channel = await connection.createChannel();
    await channel.assertQueue("transactions", {
        durable: true,
    });

    return channel;
}

export async function getChannel(): Promise<ConfirmChannel> {

    // 1. If channel already exists, reuse it.
    if (channel) {
        return channel;
    }

    // 2. If initialization is in progress, wait for it.
    if (channelPromise) {
        return await channelPromise;
    }

    // 3. Start initialization and cache the promise.
 const initializationPromise = (async () => {
        const newChannel = await connection.createConfirmChannel();

        // 4. Declare the queue.
        await newChannel.assertQueue("transactions", {
            durable: true,
        });
        newChannel.on("close", () => { //close: stale cached channel reference clear ho jayega.
    if (channel === newChannel) { //channel === newChannel: ensure karta hai ke hum kisi newer channel ka reference accidentally clear na kar dein.
        channel = null;
        channelPromise = null;
    }
    console.log("Publisher channel closed.");
});

newChannel.on("error", (error) => { //error: channel-level errors log honge.
    console.error("Publisher channel error:", error.message);
});

        // 5. Save the initialized channel.
        channel = newChannel;

        return newChannel;
})();

channelPromise = initializationPromise;
    //purpose of try tactch block:
    try {
        return await initializationPromise; //Clears the failed promise so a future call can retry.
    } catch (error) {
        // Allow a future call to retry initialization.
       if (channelPromise === initializationPromise) {
        channelPromise = null;
    }
        throw error;
    }
}

export async function getConsumerChannel(): Promise<Channel> {
    if (consumerChannel) return consumerChannel;

    if (consumerChannelPromise) return consumerChannelPromise;

    const initializationPromise = (async () => {
        const newChannel = await connection.createChannel();

        await newChannel.assertQueue("transactions", {
            durable: true,
        });
        //prefetch(1) means RabbitMQ won't send another message to this 
        // consumer while one message is still unacknowledged. 
        await newChannel.prefetch(1);
        newChannel.on("close", () => {
    if (consumerChannel === newChannel) {
        consumerChannel = null;
        consumerChannelPromise = null;
    }
    console.log("Consumer channel closed.");
});

newChannel.on("error", (error) => {
    console.error("Consumer channel error:", error.message);
});
        consumerChannel = newChannel;
        return newChannel;
   })();
consumerChannelPromise = initializationPromise;
    try {
    return await initializationPromise;
} catch (error) {
    if (consumerChannelPromise === initializationPromise) {
        consumerChannelPromise = null;
    }
    throw error;
}
}
export async function setupRetryInfrastructure(
    channel: Channel
): Promise<void> {
    //Dead Letter Queue (DLQ) for failed transactions
    await channel.assertQueue("transactions-dlq", {
        durable: true,
    });
    //Retry Queue for transactions that need to be retried
    await channel.assertQueue("transactions-retry",
        {
            durable: true,   //Queue broker restart ke baad survive karegi
            arguments: {
                "x-message-ttl": 5000,     //Retry queue mein message 5 seconds wait karega
                "x-dead-letter-exchange": "",  //Default exchange use hoga
                "x-dead-letter-routing-key": "transactions"   //Default exchange use hoga
            },
        });
}