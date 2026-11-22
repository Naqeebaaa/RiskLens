
import "dotenv/config";
import express from "express";
import { startTransactionConsumer } from "./consumer/transaction-consumer.js";
import router from "./alerts/alert.routes.js";

const app = express();
const PORT = Number(process.env.PORT ?? 8000);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "risklens",
  });
});
app.use("/api/alerts", router);

await startTransactionConsumer();
app.listen(PORT, () => {
  console.log(`RiskLens server running on port ${PORT}`);
});

