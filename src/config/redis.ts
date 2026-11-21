import { env } from "./env.js";
import { Redis } from "ioredis";

export const redis = new Redis(env.REDIS_URL);