
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@repo/db/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

async function checkAdmin() {
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL not found");
        process.exit(1);
    }
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql, { schema });

    const admin = await db.query.users.findFirst({
        where: eq(schema.users.email, "admin@techvault.com"),
    });

    if (admin) {
        console.log("Admin found:", admin.email);
        console.log("Role:", admin.role);
        console.log("Password Hash length:", admin.passwordHash?.length);
    } else {
        console.log("Admin user NOT found.");
    }
}

checkAdmin();
