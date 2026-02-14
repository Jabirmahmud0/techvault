import { productsService } from "./src/modules/products/products.service"; // Adjust path if needed
import { redis } from "./src/config/redis";

async function verify() {
    console.log("🚀 Starting Redis Cache Verification...");

    if (!redis) {
        console.warn("⚠️ Redis is NOT configured. This test will only verify DB fallback.");
    } else {
        console.log("✅ Redis client is configured.");
        // Clear flush db or specific keys to start fresh? 
        // Better not flush db in case of shared instance.
        // Let's just invalidate version.
        await redis.del("products:version");
    }

    // 1. First Call (Miss)
    console.log("\n1️⃣ Performing first product list (Cache MISS expected)...");
    const start1 = performance.now();
    const result1 = await productsService.list({ page: 1, limit: 5, sort: "newest" });
    const end1 = performance.now();
    console.log(`   Time: ${(end1 - start1).toFixed(2)}ms`);
    console.log(`   Items: ${result1.data.length}`);

    // 2. Second Call (Hit)
    console.log("\n2️⃣ Performing second product list (Cache HIT expected)...");
    const start2 = performance.now();
    const result2 = await productsService.list({ page: 1, limit: 5, sort: "newest" });
    const end2 = performance.now();
    console.log(`   Time: ${(end2 - start2).toFixed(2)}ms`);

    if (redis) {
        if (end2 - start2 < end1 - start1) {
            console.log("   ✅ Cache appears to be working (faster response).");
        } else {
            console.log("   ⚠️ Cache might be working but timing is similar (local DB is fast). check keys manually.");
        }
    }

    // 3. Invalidation Test strategy (Simulated)
    // We won't actually create a product to avoid polluting DB in this basic script unless we use transaction rollback.
    // But we can check if keys exist.
    if (redis) {
        const keys = await redis.keys("products:list:*");
        console.log(`\nKeys found in Redis matching 'products:list:*': ${keys.length}`);
        if (keys.length > 0) {
            console.log("   ✅ Cache keys created.");
        } else {
            console.error("   ❌ No cache keys found!");
        }
    }

    console.log("\n✅ Verification complete.");
    process.exit(0);
}

verify().catch(err => {
    console.error("❌ Verification failed:", err);
    process.exit(1);
});
