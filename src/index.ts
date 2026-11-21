
import "dotenv/config";
import express from "express";

const app = express();
const PORT = Number(process.env.PORT ?? 8000);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "risklens",
  });
});

app.listen(PORT, () => {
  console.log(`RiskLens server running on port ${PORT}`);
});
