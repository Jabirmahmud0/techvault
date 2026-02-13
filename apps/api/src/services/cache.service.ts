import { redis } from "../config/redis.js";

type CacheOptions = {
    ttl?: number; // Time to live in seconds
};

export class CacheService {
    private static readonly DEFAULT_TTL = 300; // 5 minutes default

    /**
     * Get item from cache
     */
    static async get<T>(key: string): Promise<T | null> {
        if (!redis) return null;

        try {
            const data = await redis.get(key);
            return data as T;
        } catch (error) {
            console.error(`[Cache] Get error for key ${key}:`, error);
            return null;
        }
    }

    /**
     * Set item in cache
     */
    static async set(
        key: string,
        value: any,
        options?: CacheOptions
    ): Promise<void> {
        if (!redis) return;

        try {
            const ttl = options?.ttl ?? this.DEFAULT_TTL;
            await redis.set(key, value, { ex: ttl });
        } catch (error) {
            console.error(`[Cache] Set error for key ${key}:`, error);
        }
    }

    /**
     * Delete item from cache
     */
    static async del(key: string): Promise<void> {
        if (!redis) return;

        try {
            await redis.del(key);
        } catch (error) {
            console.error(`[Cache] Delete error for key ${key}:`, error);
        }
    }

    /**
     * Generate a standard cache key
     */
    static generateKey(prefix: string, ...parts: string[]): string {
        return `${prefix}:${parts.join(":")}`;
    }

    /**
     * Get or Set wrapper
     * Tries to get from cache, if missing, executes fetcher and sets cache
     */
    static async remember<T>(
        key: string,
        fetcher: () => Promise<T>,
        options?: CacheOptions
    ): Promise<T> {
        if (!redis) return fetcher();

        const cached = await this.get<T>(key);
        if (cached) {
            return cached;
        }

        const data = await fetcher();
        await this.set(key, data, options);
        return data;
    }

    /**
     * Invalidate keys matching a pattern
     * Uses SCAN to find keys and deletes them
     */
    static async invalidatePattern(pattern: string): Promise<void> {
        if (!redis) return;

        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } catch (error) {
            console.error(`[Cache] Invalidate pattern error for ${pattern}:`, error);
        }
    }
}
