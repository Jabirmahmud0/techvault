import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hash } from "bcrypt";
import dotenv from "dotenv";
import * as schema from "./schema.js";

dotenv.config({ path: "../../.env" });

const SALT_ROUNDS = 12;

async function createSeller() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error("DATABASE_URL is not set in .env");
    }

    const sql = neon(databaseUrl);
    const db = drizzle(sql, { schema });

    console.log("👤 Creating seller user...");
    const password = await hash("Seller123!", SALT_ROUNDS);

    const [seller] = await db
        .insert(schema.users)
        .values({
            name: "Default Seller",
            email: "seller@techvault.com",
            passwordHash: password,
            role: "SELLER",
            emailVerified: true,
        })
        .onConflictDoNothing()
        .returning();

    if (seller) {
        console.log("✅ Created Seller: seller@techvault.com / Seller123!");
    } else {
        console.log("⚠️  Seller already exists or could not be created.");
    }
}

createSeller().catch((err) => {
    console.error("❌ Failed to create seller:", err);
    process.exit(1);
});
