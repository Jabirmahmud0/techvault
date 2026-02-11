import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";

/**
 * Creates a Drizzle database client connected to Neon PostgreSQL.
 * Requires DATABASE_URL environment variable to be set.
 */
export function createDb(databaseUrl: string) {
    const sql = neon(databaseUrl);
    return drizzle(sql, { schema });
}

/** Pre-configured database type for use across the application */
export type Database = ReturnType<typeof createDb>;

// Re-export all schema for convenience
export * from "./schema.js";
