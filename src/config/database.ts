import { Pool } from "pg";
import { env } from "./env.js";

export const pool = new Pool({
  host: "localhost",
  port: 5433,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,

  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});