const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

const DATABASE_URL = "postgresql://neondb_owner:npg_jb7IXYqOCFL2@ep-calm-darkness-a1ddlwe4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);
const logFile = path.resolve(__dirname, "js-migration-log.txt");

function log(msg) {
    try {
        fs.appendFileSync(logFile, msg + "\n");
        console.log(msg);
    } catch (e) {
        // ignore
    }
}

async function main() {
    try {
        fs.writeFileSync(logFile, "");
        log("Starting JS FORCE migration...");

        // 1. Check if table exists
        const check = await sql`
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'settings'
        );
    `;
        log("Table 'settings' exists? " + check[0].exists);

        if (!check[0].exists) {
            log("Creating table...");
            await sql`
            CREATE TABLE settings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                store_name VARCHAR(255) DEFAULT 'TechVault' NOT NULL,
                store_email VARCHAR(255) NOT NULL,
                store_url VARCHAR(255),
                currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
                tax_rate DECIMAL(5, 2) DEFAULT 0 NOT NULL,
                shipping_fee DECIMAL(10, 2) DEFAULT 0 NOT NULL,
                free_shipping_threshold DECIMAL(10, 2),
                low_stock_threshold INTEGER DEFAULT 10 NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
            );
        `;
            log("Table created.");
        } else {
            log("Table already exists. Skipping creation.");
        }

        // 2. Check for rows
        const rows = await sql`SELECT count(*) FROM settings`;
        log("Row count: " + rows[0].count);

        if (parseInt(rows[0].count) === 0) {
            log("Inserting default settings...");
            await sql`
            INSERT INTO settings (store_name, store_email, currency, tax_rate, shipping_fee, low_stock_threshold)
            VALUES ('TechVault', 'admin@techvault.com', 'USD', 0, 0, 10);
        `;
            log("Default settings inserted.");
        }

        log("Migration complete.");

    } catch (e) {
        log("Migration FAILED: " + e.message);
    }
}

main();
