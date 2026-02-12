import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/index.js";

// Route imports
import authRoutes from "./modules/auth/auth.routes.js";
import productsRoutes from "./modules/products/products.routes.js";
import categoriesRoutes from "./modules/categories/categories.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import checkoutRoutes from "./modules/checkout/checkout.routes.js";
import ordersRoutes from "./modules/orders/orders.routes.js";
import uploadRoutes from "./modules/upload/upload.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import couponsRoutes from "./modules/coupons/coupons.routes.js";
import { settingsRouter } from "./modules/settings/settings.routes.js";




import { db } from "./config/database.js";
import { sql } from "drizzle-orm";

const app = express();

app.get("/api/fix-db-settings", async (req, res) => {
  try {
    console.log("Attempting migration fix...");
    await db.execute(sql`
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
        `);
    console.log("Table created (or existed).");
    await db.execute(sql`
            INSERT INTO settings (store_name, store_email, currency, tax_rate, shipping_fee, low_stock_threshold)
            SELECT 'TechVault', 'admin@techvault.com', 'USD', 0, 0, 10
            WHERE NOT EXISTS (SELECT 1 FROM settings)
        `);
    console.log("Data inserted.");
    res.send("Migration fix applied successfully.");
  } catch (e: any) {
    console.error("Migration failed:", e);
    res.status(500).send("Migration fix failed: " + e.message);
  }
});

app.get("/api/fix-db-shipping", async (req, res) => {
  try {
    console.log("Attempting shipping column fix...");
    await db.execute(sql`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS shipping_address JSONB;
        `);
    console.log("Column added (or existed).");
    res.send("Shipping column fix applied successfully.");
  } catch (e: any) {
    console.error("Migration failed:", e);
    res.status(500).send("Migration fix failed: " + e.message);
  }
});

// ── Global Middleware ────────────────────────────────────────────────────

// Security headers
app.use(helmet());

// CORS — whitelist frontend only
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again later" },
});
app.use("/api", limiter);

// Stricter rate limit on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { success: false, error: "Too many auth attempts, please try again later" },
});
app.use("/api/auth", authLimiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health Check ─────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    },
  });
});

// ── API Routes ───────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/coupons", couponsRoutes);
app.use("/api/settings", settingsRouter);

// ── 404 Handler ──────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// ── Error Handler (must be last) ─────────────────────────────────────────

app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────────────

app.listen(env.PORT, () => {
  console.log(`\n🚀 TechVault API running on http://localhost:${env.PORT}`);
  console.log(`📁 Environment: ${env.NODE_ENV}`);
  console.log(`🌐 CORS origin: ${env.FRONTEND_URL}\n`);
});

export default app;