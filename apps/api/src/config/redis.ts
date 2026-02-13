import { Redis } from "@upstash/redis";
import { env } from "./env.js";

// Initialize Redis client only if configuration is present
// We wrap this to avoid crashing if env vars are missing during build/dev without redis
export const redis =
    env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
        ? new Redis({
            url: env.UPSTASH_REDIS_REST_URL,
            token: env.UPSTASH_REDIS_REST_TOKEN,
        })
        : null;

if (!redis) {
    console.warn(
        "⚠️ Redis is not configured. Caching will be disabled. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env"
    );
}
