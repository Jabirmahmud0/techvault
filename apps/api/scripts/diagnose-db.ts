import { db } from "../src/config/database.js"; // Adjust path as needed
import { sql } from "drizzle-orm";
import dotenv from "dotenv";
import path from "path";

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

async function main() {
    try {
        console.log("Starting DB Diagnosis...");
        console.log("Environment DB URL:", process.env.DATABASE_URL ? "Defined" : "Undefined");

        // 1. Check current database name
        const dbNameInfo = await db.execute(sql`SELECT current_database();`);
        console.log("Connected DB Name:", dbNameInfo[0].current_database);

        // 2. Check if table exists in information_schema
        const tableCheck = await db.execute(sql`
            SELECT count(*) FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'settings'
        `);
        console.log("Settings table exists in info_schema?", tableCheck[0].count > 0);

        // 3. Try to select from settings
        try {
            const count = await db.execute(sql`SELECT count(*) FROM settings`);
            console.log("Rows in settings table:", count[0].count);
        } catch (e: any) {
            console.log("Error selecting from settings:", e.message);
        }

    } catch (e: any) {
        console.error("Diagnosis Fatal Error:", e);
    }
    process.exit(0);
}

main();
