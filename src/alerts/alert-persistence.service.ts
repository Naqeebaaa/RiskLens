// Is service ki responsibility sirf database mein alerts persist karna 
// hogi. Detection aur risk scoring already separate hain — unhein mix nahi karenge.

import { pool } from "../config/database.js";
import type { AccountRisk } from "../detection/risk/risk-score.types.js";

//The responisbility of this function is to convert every account risk into database alert record
//2. to insert it into Postgres //3. Ignore duplicate Alert
export async function persistAlerts(
  alertCandidates: AccountRisk[]
): Promise<number> { 
    // Promise<number> ka matlab function asynchronously database
    //  operation complete karega aur inserted alerts ki count return karega.
if (alertCandidates.length === 0) {
  return 0;
}

let insertedCount = 0;

for (const candidate of alertCandidates) {
  const result = await pool.query(
    `INSERT INTO alerts (
      account_id,
      transaction_id,
      risk_score,
      risk_level,
      triggered_rules
    )
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (account_id, transaction_id) DO NOTHING`,
    [
      candidate.accountId,
      candidate.transactionId,
      candidate.riskScore,
      candidate.riskLevel,
      candidate.triggeredRules,
    ]
  );

  insertedCount += result.rowCount ?? 0;
}

return insertedCount;
}