import { createDb } from "./src/index";
import { settings } from "./src/schema";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const db = createDb(process.env.DATABASE_URL!);

const logFile = path.resolve(__dirname, "debug-log.txt");

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
        // Clear log file
        fs.writeFileSync(logFile, "");

        log("Starting check-setup.ts...");
        log("DB URL defined: " + !!process.env.DATABASE_URL);

        log("Checking settings table...");
        try {
            const result = await db.select().from(settings).limit(1);
            log("Success! Found " + result.length + " settings.");
        } catch (inner: any) {
            log("Query failed: " + inner.message);
            if (inner.message.indexOf("relation \"settings\" does not exist") !== -1) {
                log("MIGRATION REQUIRED");
            }
            throw inner;
        }
    } catch (e: any) {
        log("Fatal error: " + e.message);
    }
    process.exit(0);
}

main();
