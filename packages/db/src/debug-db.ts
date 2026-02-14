
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
    console.log("DATABASE_URL start:", process.env.DATABASE_URL.substring(0, 15));
} else {
    console.error("DATABASE_URL is MISSING!");
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function check() {
    console.log("Checking DB connection...");
    try {
        const result = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'otp_code';
        `;
        console.log("Result:", result);
        if (result.length > 0) {
            console.log("✅ Column 'otp_code' exists!");
        } else {
            console.log("❌ Column 'otp_code' DOES NOT exist.");
        }
    } catch (e) {
        console.error("Error connecting:", e);
    }
}

check();
