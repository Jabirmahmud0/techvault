
import { db } from "./src/config/database";
import { users } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { env } from "./src/config/env";

async function debug() {
    console.log("--------------- DEBUG START ---------------");
    console.log("DB URL (from env.ts):", env.DATABASE_URL.replace(/:[^:@]+@/, ":****@"));

    try {
        console.log("Querying for seller@techvault.com...");
        const user = await db.query.users.findFirst({
            where: eq(users.email, "seller@techvault.com")
        });

        if (user) {
            console.log("✅ User FOUND:", user.id, user.role);
            console.log("   Hash:", user.passwordHash?.substring(0, 10) + "...");
        } else {
            console.log("❌ User NOT FOUND");

            // List all users to see what's there
            const allUsers = await db.query.users.findMany({
                columns: { email: true, role: true }
            });
            console.log("Existing users:", allUsers);
        }
    } catch (e) {
        console.error("❌ Query FAILED:", e);
    }
    console.log("--------------- DEBUG END ---------------");
    process.exit(0);
}

debug();
