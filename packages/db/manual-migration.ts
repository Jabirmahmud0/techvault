import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import path from "path";

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
    try {
        console.log("Running manual migration for 'settings' table...");

        await sql`
      CREATE TABLE IF NOT EXISTS settings (
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

        console.log("Migration successful!");

        // Create a default row if not exists
        const rows = await sql`SELECT * FROM settings LIMIT 1`;
        if (rows.length === 0) {
            console.log("Inserting default settings...");
            await sql`
            INSERT INTO settings (store_name, store_email, currency, tax_rate, shipping_fee, low_stock_threshold)
            VALUES ('TechVault', 'admin@techvault.com', 'USD', 0, 0, 10);
        `;
            console.log("Default settings inserted.");
        }

    } catch (e: any) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
    process.exit(0);
}

main();
