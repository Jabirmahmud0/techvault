
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../../packages/db/src/schema.ts"; // Direct path to schema
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
import path from "path";

console.log("STARTING DIRECT DEBUG...");

// Manually load env
const envPath = path.resolve(__dirname, "../../.env");
console.log("Loading env from:", envPath);
dotenv.config({ path: envPath });

async function check() {
    try {
        const url = process.env.DATABASE_URL;
        if (!url) throw new Error("DATABASE_URL missing");

        console.log("URL Found:", url.replace(/:[^:@]+@/, ":****@"));

        const sql = neon(url);
        const db = drizzle(sql, { schema });

        console.log("Querying...");
        const user = await db.query.users.findFirst({
            where: eq(schema.users.email, "seller@techvault.com")
        });

        if (user) {
            console.log("✅ FOUND USER:", user.email, user.role);
            console.log("   Hash prefix:", user.passwordHash?.substring(0, 10));
        } else {
            console.log("❌ USER NOT FOUND");
        }
    } catch (e) {
        console.error("ERROR:", e);
    }
    process.exit(0);
}

check();
