import { sql } from "drizzle-orm";
import { db } from "./config/database.js";
import app from "./app.js";
import { env } from "./config/env.js";

async function startServer() {
  try {
    // Self-healing migration for OTP columns (executed separately for Neon HTTP driver compatibility)
    console.log("🛠️ Checking database schema for OTP columns...");
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6)`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP WITH TIME ZONE`);
    console.log("✅ Database schema verified — OTP columns ready.");
  } catch (error) {
    console.error("⚠️ Failed to verify schema:", error);
  }

  app.listen(env.PORT, () => {
    console.log(`\n🚀 TechVault API running on http://localhost:${env.PORT}`);
    console.log(`📁 Environment: ${env.NODE_ENV}`);
    console.log(`🌐 CORS origin: ${env.FRONTEND_URL}\n`);
  });
}

startServer();