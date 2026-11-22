//Alert retrieval service Responsibility:
// PostgreSQL se alerts fetch karna.
// Latest alerts pehle return karna.
// Database query ko controller se separate rakhna.

import { pool } from "../config/database.js";

export async function getAlerts() {
  // database query
  // return retrieved rows
const result = await pool.query(
    `SELECT
  id,
  account_id,
  transaction_id,
  risk_score,
  risk_level,
  triggered_rules,
  status,
  created_at
FROM alerts
ORDER BY created_at DESC;`
)
return result.rows;
}

// Function ki responsibility:
// 1. Alert ID receive karna.
// 2. PostgreSQL mein us ID ka alert search karna.
// 3. Matching record return karna.
// 4. Record na mile to null return karna.
export async function getAlertById(id: string) {

}