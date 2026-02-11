import { createDb } from "@repo/db";
import { env } from "./env.js";

/** Shared database instance for the API */
export const db = createDb(env.DATABASE_URL);
