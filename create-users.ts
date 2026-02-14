
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const SALT_ROUNDS = 12;

async function createUsers() {
    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL not found in .env");
        process.exit(1);
    }

    console.log("🔌 Connecting to database...");
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql, { schema });

    // 1. Create/Update Admin
    console.log("\n👑 Processing Admin User...");
    const adminEmail = "admin@techvault.com";
    const adminPassword = "Admin123!";
    const adminHash = await hash(adminPassword, SALT_ROUNDS);

    const existingAdmin = await db.query.users.findFirst({
        where: eq(schema.users.email, adminEmail),
    });

    if (existingAdmin) {
        await db.update(schema.users)
            .set({ passwordHash: adminHash, role: "ADMIN" })
            .where(eq(schema.users.email, adminEmail));
        console.log(`✅ Admin updated: ${adminEmail} / ${adminPassword}`);
    } else {
        await db.insert(schema.users).values({
            name: "Admin User",
            email: adminEmail,
            passwordHash: adminHash,
            role: "ADMIN",
            emailVerified: true
        });
        console.log(`✅ Admin created: ${adminEmail} / ${adminPassword}`);
    }

    // 2. Create/Update Seller
    console.log("\n💼 Processing Seller User...");
    const sellerEmail = "seller@techvault.com";
    const sellerPassword = "Seller123!";
    const sellerHash = await hash(sellerPassword, SALT_ROUNDS);

    const existingSeller = await db.query.users.findFirst({
        where: eq(schema.users.email, sellerEmail),
    });

    if (existingSeller) {
        await db.update(schema.users)
            .set({ passwordHash: sellerHash, role: "SELLER" }) // Ensure role is SELLER
            .where(eq(schema.users.email, sellerEmail));
        console.log(`✅ Seller updated: ${sellerEmail} / ${sellerPassword}`);
    } else {
        await db.insert(schema.users).values({
            name: "Default Seller",
            email: sellerEmail,
            passwordHash: sellerHash,
            role: "SELLER",
            emailVerified: true
        });
        console.log(`✅ Seller created: ${sellerEmail} / ${sellerPassword}`);
    }

    console.log("\n✨ Done!");
    process.exit(0);
}

createUsers().catch((err) => {
    console.error("❌ Fatal Error:", err);
    process.exit(1);
});
