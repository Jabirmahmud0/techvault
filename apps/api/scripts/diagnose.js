const { neon } = require("@neondatabase/serverless");

// HARDCODED CREDENTIALS FROM .ENV
const DATABASE_URL = "postgresql://neondb_owner:npg_jb7IXYqOCFL2@ep-calm-darkness-a1ddlwe4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function main() {
    try {
        console.log("Starting JS Diagnosis...");
        console.log("Target DB Host: " + DATABASE_URL.split("@")[1]);

        const sql = neon(DATABASE_URL);

        // 1. Check current database name
        const dbNameInfo = await sql`SELECT current_database()`;
        console.log("Connected DB Name:", dbNameInfo[0].current_database);

        // 2. Check if table exists in information_schema
        const tableCheck = await sql`
            SELECT count(*) FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'settings'
        `;
        console.log("Settings table exists in info_schema?", tableCheck[0].count > 0);

        // 3. Try to select from settings
        try {
            const count = await sql`SELECT count(*) FROM settings`;
            console.log("Rows in settings table:", count[0].count);
        } catch (e) {
            console.log("Error selecting from settings:", e.message);
        }

    } catch (e) {
        console.error("Diagnosis Fatal Error:", e);
    }
}

main();
