import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

async function checkProducts() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error("DATABASE_URL not set");
        process.exit(1);
    }
    const sql = neon(databaseUrl);
    const db = drizzle(sql, { schema });

    const products = await db.query.products.findMany({
        columns: {
            name: true,
            slug: true,
        }
    });

    console.log("🛒 Current Products in DB:");
    products.forEach(p => console.log(`- [${p.slug}] ${p.name}`));
}

checkProducts().catch(console.error);
