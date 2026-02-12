
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const SALT_ROUNDS = 12;

async function resetAdmin() {
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL not found");
        process.exit(1);
    }
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql, { schema });

    console.log("Hashing password...");
    const passwordHash = await hash("Admin123!", SALT_ROUNDS);

    console.log("Updating admin user...");
    const [updatedUser] = await db
        .update(schema.users)
        .set({ passwordHash })
        .where(eq(schema.users.email, "admin@techvault.com"))
        .returning();

    if (updatedUser) {
        console.log("✅ Admin password reset successfully.");
        console.log("Email: admin@techvault.com");
        console.log("Password: Admin123!");
    } else {
        console.error("❌ Admin user not found. Creating one...");
        // Fallback: Create if not exists
        await db.insert(schema.users).values({
            name: "Admin",
            email: "admin@techvault.com",
            passwordHash,
            role: "ADMIN",
            emailVerified: true
        });
        console.log("✅ Admin user created.");
    }
}

resetAdmin().catch(console.error);
