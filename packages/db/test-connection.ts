import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const url = process.env.DATABASE_URL;
console.log("DATABASE_URL:", url?.replace(/:[^:@]+@/, ":****@")); // mask password

async function test() {
    try {
        const { neon } = await import("@neondatabase/serverless");
        const sql = neon(url!);
        const result = await sql`SELECT 1 as connected`;
        console.log("✅ Database connected!", result);
    } catch (err: any) {
        console.error("❌ Connection failed!");
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        console.error("Error cause:", err.cause);
        console.error("Full error:", err);
    }
}

test();
