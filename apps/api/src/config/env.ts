import { z } from "zod";
console.log("Starting env load...");
import dotenv from "dotenv";

// Load root .env first (DB, JWT, server config)
dotenv.config({ path: "../../.env" });
// Load local .env second — overrides root values where present (OAuth, Cloudinary, etc.)
dotenv.config({ override: true });

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


    // Redis (Upstash)
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

    // Stripe
    STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
    STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),

    // Email (Resend or SMTP)
    RESEND_API_KEY: z.string().optional(),

    // Firebase
    FIREBASE_PROJECT_ID: z.string().min(1).optional(),
    FIREBASE_CLIENT_EMAIL: z.string().min(1).optional(),
    FIREBASE_PRIVATE_KEY: z.string().min(1).optional(),

    // SMTP (Gmail)
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().optional().default("noreply@example.com"),
});

/** Parsed and typed environment variables */
export const env = envSchema.parse(process.env);

// Diagnostic: Show which DATABASE_URL is loaded
console.log("📦 DATABASE_URL:", env.DATABASE_URL.replace(/:[^:@]+@/, ":****@"));

export type Env = z.infer<typeof envSchema>;
