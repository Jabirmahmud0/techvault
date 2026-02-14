
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import * as schema from "./src/schema";
import { eq } from "drizzle-orm";

dotenv.config({ path: "../../.env" });
const SALT_ROUNDS = 12;

async function reset() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error("DATABASE_URL is not set");
        process.exit(1);
    }
    console.log("DB URL Found:", databaseUrl.substring(0, 20) + "...");

    const sql = neon(databaseUrl);
    const db = drizzle(sql, { schema });

    console.log("🔄 Resetting password for seller@techvault.com...");
    const newHash = await bcrypt.hash("Seller123!", SALT_ROUNDS);

    // First try update
    const result = await db.update(schema.users)
        .set({ passwordHash: newHash, role: "SELLER" }) // Ensure role is SELLER
        .where(eq(schema.users.email, "seller@techvault.com"))
        .returning();

    if (result.length > 0) {
        console.log("✅ Updated existing seller account.");
    } else {
        console.log("⚠️ Seller not found. Creating new account...");
        await db.insert(schema.users).values({
            name: "Default Seller",
            email: "seller@techvault.com",
            passwordHash: newHash,
            role: "SELLER",
            emailVerified: true,
        });
        console.log("✅ Created new seller account.");
    }

    console.log("✅ DONE. Password is: Seller123!");
    process.exit(0);
}

reset().catch((e) => {
    console.error(e);
    process.exit(1);
});
