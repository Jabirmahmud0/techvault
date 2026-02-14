import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hash } from "bcrypt";
import dotenv from "dotenv";
import * as schema from "./src/schema";
import { eq } from "drizzle-orm";

dotenv.config({ path: "../../.env" });

const SALT_ROUNDS = 12;

async function checkAndFix() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error("DATABASE_URL is not set");
        process.exit(1);
    }

    const sql = neon(databaseUrl);
    const db = drizzle(sql, { schema });

    console.log("🔍 Checking for seller@techvault.com...");
    const seller = await db.query.users.findFirst({
        where: eq(schema.users.email, "seller@techvault.com")
    });

    if (seller) {
        console.log("✅ Seller found. ID:", seller.id);
        console.log("   Current Hash:", seller.passwordHash.substring(0, 10) + "...");

        // Reset password to ensure it's correct
        console.log("🔄 Resetting password to 'Seller123!'...");
        const newHash = await hash("Seller123!", SALT_ROUNDS);

        await db.update(schema.users)
            .set({ passwordHash: newHash })
            .where(eq(schema.users.id, seller.id));

        console.log("✅ Password reset successful.");
    } else {
        console.log("❌ Seller NOT found. Creating...");
        const password = await hash("Seller123!", SALT_ROUNDS);
        await db.insert(schema.users).values({
            name: "Default Seller",
            email: "seller@techvault.com",
            passwordHash: password,
            role: "SELLER",
            emailVerified: true,
        });
        console.log("✅ Seller created.");
    }
    process.exit(0);
}

checkAndFix().catch((err) => {
    console.error(err);
    process.exit(1);
});
