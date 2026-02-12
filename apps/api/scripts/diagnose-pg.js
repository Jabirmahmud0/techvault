const { Client } = require("pg");

// HARDCODED CREDENTIALS FROM .ENV
const DATABASE_URL = "postgresql://neondb_owner:npg_jb7IXYqOCFL2@ep-calm-darkness-a1ddlwe4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Common fix for SSL issues in dev
});

async function main() {
    try {
        console.log("Starting PG Diagnosis...");
        console.log("Target DB Host: " + DATABASE_URL.split("@")[1]);

        await client.connect();
        console.log("Connected successfully.");

        // 1. Check current database name
        const dbNameInfo = await client.query("SELECT current_database()");
        console.log("Connected DB Name:", dbNameInfo.rows[0].current_database);

        // 2. Check if table exists in information_schema
        const tableCheck = await client.query(`
            SELECT count(*) FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'settings'
        `);
        console.log("Settings table exists in info_schema?", tableCheck.rows[0].count > 0);

        // 3. Try to select from settings
        try {
            const count = await client.query("SELECT count(*) FROM settings");
            console.log("Rows in settings table:", count.rows[0].count);
        } catch (e) {
            console.log("Error selecting from settings:", e.message);
        }

        await client.end();

    } catch (e) {
        console.error("Diagnosis Fatal Error:", e);
        try { await client.end(); } catch (err) { }
    }
}

main();
