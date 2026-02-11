import { z } from "zod";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

/**
 * Environment variable schema — validated at startup.
 * If any required variable is missing, the server will not start.
 */
const envSchema = z.object({
    // Server
    PORT: z.coerce.number().default(4000),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    // Database
    DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

    // JWT
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 chars"),
    JWT_ACCESS_EXPIRY: z.string().default("15m"),
    JWT_REFRESH_EXPIRY: z.string().default("7d"),

    // CORS
    FRONTEND_URL: z.string().url().default("http://localhost:3000"),
});

/** Parsed and typed environment variables */
export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
