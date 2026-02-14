import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import dotenv from "dotenv";
import * as schema from "./src/schema.js";
import { eq } from "drizzle-orm";

console.log("🔍 STARTING SELLER CHECK...");
dotenv.config({ path: "../../.env" });

async function check() {
    try {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            console.error("❌ DATABASE_URL is not set");
            process.exit(1);
        }
        console.log("  ✅ DB URL found (length: " + databaseUrl.length + ")");

        const sql = neon(databaseUrl);
        const db = drizzle(sql, { schema });

        console.log("  🔄 Querying database for seller@techvault.com...");
        const seller = await db.query.users.findFirst({
            where: eq(schema.users.email, "seller@techvault.com")
        });

        if (seller) {
            console.log("✅ FOUND: Seller exists with ID:", seller.id);
            console.log("  Name:", seller.name);
            console.log("  Role:", seller.role);
        } else {
            console.log("❌ NOT FOUND: Seller does not exist.");
        }
    } catch (e) {
        console.error("❌ ERROR:", e);
    }
}
check();
