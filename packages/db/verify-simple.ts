import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const sql = neon(process.env.DATABASE_URL!);
const logFile = path.resolve(__dirname, "verify-log.txt");

function log(msg: string) {
    try {
        fs.appendFileSync(logFile, msg + "\n");
        console.log(msg);
    } catch (e) {
        // ignore
    }
}

async function main() {
    try {
        fs.writeFileSync(logFile, ""); // Clear log
        log("Verifying settings table...");

        const result = await sql`SELECT count(*) FROM settings`;
        log("Success! Settings count: " + result[0].count);

    } catch (e: any) {
        log("Verification failed: " + e.message);
    }
    process.exit(0);
}

main();
