
import fs from 'fs';
import dotenv from 'dotenv';

try {
    dotenv.config({ path: '../../.env' });
    const dbUrl = process.env.DATABASE_URL;
    const status = dbUrl ? 'DATABASE_URL is set' : 'DATABASE_URL is MISSING';
    fs.writeFileSync('debug_status.txt', `Debug Log:\n${status}\nEnd of Log`);
} catch (e) {
    fs.writeFileSync('debug_status.txt', `Error: ${e.message}`);
}
