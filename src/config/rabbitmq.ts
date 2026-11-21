import amqp from "amqplib";
import { env } from "./env.js";

const url = `amqp://${env.RABBITMQ_USER}:${env.RABBITMQ_PASSWORD}@localhost:5672?heartbeat=30`;
export const connection = await amqp.connect(url);
connection.on("error", (error) => {
  console.error("RabbitMQ connection error:", error.message);
});

connection.on("close", () => {
  console.error("RabbitMQ connection closed");
});