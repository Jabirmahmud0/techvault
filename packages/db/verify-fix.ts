
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
    console.log('Verifying shipping_address column in orders table...');
    try {
        const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'shipping_address';
    `;

        if (result.length > 0) {
            console.log('VERIFICATION SUCCESS: Column shipping_address exists.');
            console.log('Details:', result[0]);
        } else {
            console.error('VERIFICATION FAILED: Column shipping_address NOT found.');
            process.exit(1);
        }
    } catch (error) {
        console.error('Verification failed with error:', error);
        process.exit(1);
    }
}

main();
