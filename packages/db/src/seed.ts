import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql as drizzleSql } from "drizzle-orm";
import { hash } from "bcrypt";
import dotenv from "dotenv";
import * as schema from "./schema.js";

dotenv.config({ path: "../../.env" });

const SALT_ROUNDS = 12;

/**
 * Seeds the database with initial categories, products, and users.
 * Run with: npm run db:seed (from packages/db)
 */
async function seed() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error("DATABASE_URL is not set in .env");
    }

    const sql = neon(databaseUrl);
    const db = drizzle(sql, { schema });

    console.log("🌱 STARTING SEED SCRIPT...");
    console.log("🌱 Database URL present:", !!databaseUrl);
    console.log("🌱 Seeding database...\n");

    // ── 1. Seed Admin + Test Users ─────────────────────────────────────────
    console.log("👤 Creating users...");
    const adminPassword = await hash("Admin123!", SALT_ROUNDS);
    const userPassword = await hash("User1234!", SALT_ROUNDS);

    const [adminUser] = await db
        .insert(schema.users)
        .values({
            name: "Admin",
            email: "admin@techvault.com",
            passwordHash: adminPassword,
            role: "ADMIN",
            emailVerified: true,
        })
        .onConflictDoNothing()
        .returning();

    const [testUser] = await db
        .insert(schema.users)
        .values({
            name: "Test User",
            email: "user@techvault.com",
            passwordHash: userPassword,
            role: "USER",
            emailVerified: true,
        })
        .onConflictDoNothing()
        .returning();

    // If users already existed, fetch them
    const { eq } = await import("drizzle-orm");
    const admin = adminUser ?? await db.query.users.findFirst({ where: eq(schema.users.email, "admin@techvault.com") });
    const testUsr = testUser ?? await db.query.users.findFirst({ where: eq(schema.users.email, "user@techvault.com") });

    const [sellerUser] = await db
        .insert(schema.users)
        .values({
            name: "Seller",
            email: "seller@techvault.com",
            passwordHash: await hash("Seller123!", SALT_ROUNDS),
            role: "SELLER",
            emailVerified: true,
        })
        .onConflictDoNothing()
        .returning();

    console.log(`  ✅ Admin: admin@techvault.com / Admin123!`);
    console.log(`  ✅ User: user@techvault.com / User1234!`);
    console.log(`  ✅ Seller: seller@techvault.com / Seller123!\n`);

    // ── 2. Seed Categories ─────────────────────────────────────────────────
    console.log("📂 Creating categories...");
    const categoryData = [
        { name: "Smartphones", slug: "smartphones", description: "Latest smartphones and mobile devices", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400" },
        { name: "Laptops", slug: "laptops", description: "Powerful laptops for work and gaming", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400" },
        { name: "Tablets", slug: "tablets", description: "Tablets for productivity and entertainment", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400" },
        { name: "Smartwatches", slug: "smartwatches", description: "Wearable tech and smartwatches", image: "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=400" },
        { name: "Cameras", slug: "cameras", description: "Digital cameras and photography gear", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400" },
        { name: "Headphones", slug: "headphones", description: "Premium audio and noise cancelling headphones", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400" },
    ];

    const insertedCategories = await db
        .insert(schema.categories)
        .values(categoryData)
        .onConflictDoNothing()
        .returning();

    // If categories already existed, fetch them all
    let categoryList = insertedCategories;
    if (insertedCategories.length === 0) {
        categoryList = await db.query.categories.findMany();
    }

    const categoryMap = Object.fromEntries(
        categoryList.map((c) => [c.slug, c.id])
    );
    console.log(`  ✅ Created ${insertedCategories.length} categories\n`);

    // ── 3. Seed Products ───────────────────────────────────────────────────
    console.log("📦 Creating products...");
    // Correctly mapped products to match homepage hardcoding
    const productData = [
        // Smartphones
        {
            name: "iPhone 15 Pro Max",
            slug: "iphone-15-pro-max",
            description: "The most advanced iPhone ever. Featuring a titanium design, A17 Pro chip, and a powerful camera system with a 48MP main camera. ProMotion display with Always-On technology.",
            shortDescription: "Titanium design. A17 Pro chip. 48MP camera.",
            price: "1199.99",
            compareAtPrice: "1299.99",
            stock: 45,
            sku: "APPL-IP15PM-256",
            brand: "Apple",
            categoryId: categoryMap["smartphones"]!,
            sellerId: admin!.id,
            isFeatured: true,
            specifications: JSON.stringify({ display: "6.7-inch Super Retina XDR", chip: "A17 Pro", storage: "256GB", camera: "48MP + 12MP + 12MP", battery: "4441 mAh" }),
            image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop",
        },
        {
            name: "Samsung Galaxy S24 Ultra",
            slug: "samsung-galaxy-s24-ultra",
            description: "Galaxy AI is here. The ultimate Galaxy experience with the most powerful Galaxy S ever. Built with titanium, featuring a stunning 200MP camera and the smartest Galaxy AI features.",
            shortDescription: "Galaxy AI. Titanium build. 200MP camera.",
            price: "1299.99",
            compareAtPrice: "1419.99",
            stock: 38,
            sku: "SAM-GS24U-256",
            brand: "Samsung",
            categoryId: categoryMap["smartphones"]!,
            sellerId: admin!.id,
            isFeatured: true,
            specifications: JSON.stringify({ display: "6.8-inch Dynamic AMOLED 2X", chip: "Snapdragon 8 Gen 3", storage: "256GB", camera: "200MP + 12MP + 50MP + 10MP", battery: "5000 mAh" }),
            image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop",
        },
        // Laptops
        {
            name: 'MacBook Pro 16" M3',
            slug: "macbook-pro-16-m3",
            description: "The most powerful MacBook Pro ever. M3 Max chip with up to 128GB unified memory, stunning Liquid Retina XDR display, and all-day battery life for pro workflows.",
            shortDescription: "M3 Max. 128GB unified memory. All-day battery.",
            price: "2499.99",
            compareAtPrice: null,
            stock: 15,
            sku: "APPL-MBP16-M3",
            brand: "Apple",
            categoryId: categoryMap["laptops"]!,
            sellerId: admin!.id,
            isFeatured: true,
            specifications: JSON.stringify({ display: '16.2-inch Liquid Retina XDR', chip: "Apple M3", memory: "18GB", storage: "512GB SSD", battery: "22 hours" }),
            image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop",
        },
        {
            name: "Dell XPS 15 OLED",
            slug: "dell-xps-15-oled",
            description: "A stunning 15.6-inch InfinityEdge display with Intel Core Ultra processors. Precision-crafted with premium materials for the ultimate productivity machine.",
            shortDescription: "InfinityEdge display. Intel Core Ultra.",
            price: "1799.99",
            stock: 28,
            sku: "DELL-XPS15-OLED",
            brand: "Dell",
            categoryId: categoryMap["laptops"]!,
            sellerId: admin!.id,
            isFeatured: true,
            specifications: JSON.stringify({ display: '15.6-inch OLED 3.5K', processor: "Intel Core Ultra 9", memory: "32GB DDR5", storage: "1TB SSD", battery: "13 hours" }),
            image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop",
        },
        // Audio / Headphones
        {
            name: "Sony WH-1000XM5",
            slug: "sony-wh-1000xm5",
            description: "The best noise-canceling headphones on the market. Industry-leading noise cancellation, exceptional sound quality, and crystal-clear hands-free calling.",
            shortDescription: "Noise cancelling. 30hr battery. LDAC.",
            price: "349.99",
            compareAtPrice: "399.99",
            stock: 50,
            sku: "SONY-XM5",
            brand: "Sony",
            categoryId: categoryMap["headphones"]!,
            sellerId: admin!.id,
            isFeatured: true,
            specifications: JSON.stringify({ type: "Over-ear", battery: "30 hours", connectivity: "Bluetooth 5.2", weight: "250g" }),
            image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=600&fit=crop",
        },
        // Tablets
        {
            name: 'iPad Pro 12.9" M2',
            slug: "ipad-pro-12-9-m2",
            description: "The ultimate iPad experience. M2 chip, XDR display, and superfast wireless connectivity.",
            shortDescription: "M2 chip. XDR display. Pro cameras.",
            price: "1099.99",
            stock: 30,
            sku: "APPL-IPADP129-M2",
            brand: "Apple",
            categoryId: categoryMap["tablets"]!,
            sellerId: admin!.id,
            isFeatured: true,
            specifications: JSON.stringify({ display: '12.9-inch Liquid Retina XDR', chip: "Apple M2", storage: "128GB", connectivity: "Wi-Fi 6E", weight: "682 g" }),
            image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop",
        },
        // Cameras
        {
            name: "Canon EOS R6 Mark II",
            slug: "canon-eos-r6-mark-ii",
            description: "Full-frame mirrorless camera for hybrid shooters. 24.2MP sensor, 40fps continuous shooting, and 4K 60p video.",
            shortDescription: "24.2MP. 40fps. 4K 60p.",
            price: "2499.99",
            stock: 12,
            sku: "CAN-R6MII",
            brand: "Canon",
            categoryId: categoryMap["cameras"]!,
            sellerId: admin!.id,
            isFeatured: true,
            specifications: JSON.stringify({ sensor: "24.2MP CMOS", fps: "40 fps", video: "4K 60p", stabilization: "In-body 5-axis" }),
            image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop",
        },
        // Smartwatches
        {
            name: "Apple Watch Ultra 2",
            slug: "apple-watch-ultra-2",
            description: "The most rugged and capable Apple Watch ever. Titanium case, precision dual-frequency GPS, up to 36 hours battery life, and depth gauge for diving.",
            shortDescription: "Titanium. 36hr battery. Precision GPS.",
            price: "799.99",
            compareAtPrice: "899.99",
            stock: 40,
            sku: "APPL-AWU2-49",
            brand: "Apple",
            categoryId: categoryMap["smartwatches"]!,
            sellerId: admin!.id,
            isFeatured: true,
            specifications: JSON.stringify({ display: "49mm Always-On Retina", chip: "S9 SiP", battery: "36 hours", waterResistance: "100m", gps: "Dual-frequency L1/L5" }),
            image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=600&fit=crop",
        },
        // Other items for variety (retaining some original seed data)
        {
            name: "OnePlus 12",
            slug: "oneplus-12",
            description: "Flagship killer with Snapdragon 8 Gen 3, Hasselblad camera partnership, and blazing fast 100W charging.",
            shortDescription: "Snapdragon 8 Gen 3. 100W SUPERVOOC.",
            price: "799.99",
            stock: 60,
            sku: "OP-12-256",
            brand: "OnePlus",
            categoryId: categoryMap["smartphones"]!,
            sellerId: admin!.id,
            isFeatured: false,
            specifications: JSON.stringify({ display: "6.82-inch LTPO AMOLED", chip: "Snapdragon 8 Gen 3", storage: "256GB", camera: "50MP + 48MP + 64MP", battery: "5400 mAh" }),
            image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop",
        },
        {
            name: "Samsung Galaxy Tab S9 Ultra",
            slug: "samsung-galaxy-tab-s9-ultra",
            description: "The biggest, boldest Galaxy Tab. 14.6-inch Dynamic AMOLED 2X display with S Pen included and IP68 water resistance.",
            shortDescription: "14.6-inch AMOLED. S Pen. IP68.",
            price: "1199.99",
            stock: 25,
            sku: "SAM-TABS9U-256",
            brand: "Samsung",
            categoryId: categoryMap["tablets"]!,
            sellerId: admin!.id,
            isFeatured: false,
            specifications: JSON.stringify({ display: '14.6-inch Dynamic AMOLED 2X', chip: "Snapdragon 8 Gen 2", storage: "256GB", battery: "11200 mAh", spen: "Included" }),
            image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop",
        },
        {
            name: "Sony A7R V",
            slug: "sony-a7r-v",
            description: "61MP full-frame mirrorless with AI-based autofocus, 8K video, and in-body stabilization. The ultimate camera for professional photography.",
            shortDescription: "61MP. AI autofocus. 8K video.",
            price: "3899.99",
            stock: 12,
            sku: "SONY-A7RV",
            brand: "Sony",
            categoryId: categoryMap["cameras"]!,
            sellerId: admin!.id,
            isFeatured: false,
            specifications: JSON.stringify({ sensor: "61MP Full-Frame Exmor R", autofocus: "759-point AI AF", video: "8K 24p / 4K 120p", stabilization: "8-stop IBIS", evf: "9.44M-dot OLED" }),
            image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop",
        },
    ];

    const insertedProducts = await db
        .insert(schema.products)
        .values(productData.map(({ image, ...p }) => p))
        .onConflictDoUpdate({
            target: schema.products.slug,
            set: {
                name: drizzleSql`excluded.name`,
                description: drizzleSql`excluded.description`,
                price: drizzleSql`excluded.price`,
                stock: drizzleSql`excluded.stock`,
                categoryId: drizzleSql`excluded.category_id`,
                compareAtPrice: drizzleSql`excluded.compare_at_price`,
                sku: drizzleSql`excluded.sku`,
                specifications: drizzleSql`excluded.specifications`,
                isFeatured: drizzleSql`excluded.is_featured`,
            }
        })
        .returning();

    console.log(`  ✅ Created ${insertedProducts.length} products\n`);

    // ── 4. Seed Product Images ─────────────────────────────────────────────
    console.log("🖼️  Creating product images...");

    // Create a map of slug -> image URL from the input data
    const productImageMap = new Map(productData.map(p => [p.slug, p.image]));

    const imageData = insertedProducts.map((product) => {
        const imageUrl = productImageMap.get(product.slug) || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80"; // Fallback

        return {
            productId: product.id,
            url: imageUrl,
            altText: product.name,
            isPrimary: true,
            sortOrder: 0,
        };
    });

    if (imageData.length > 0) {
        // Upsert images based on productId and url (or just insert and ignore conflicts?)
        // product_images table might not have unique constraint on (productId, url) or (productId, isPrimary).
        // Let's assume onConflictDoNothing is safe enough to avoid duplicates if re-running.
        // Actually, if we re-run, we might want to update the URL if it changed?
        // But here we are inserting new ones.
        // Let's use onConflictDoNothing for now.
        // Wait, if I updated the products, I should probably ensure the images are correct.
        // If I originally seeded with the placeholder, the placeholder row exists.
        // If I insert the NEW url, it will be a NEW row (since URL is different).
        // So a product will have 2 images: placeholder and real one.
        // Both might be isPrimary=true? That would be bad.
        // Best approach: Delete existing images for these products and re-insert.

        const productIds = insertedProducts.map(p => p.id);
        const { inArray } = await import("drizzle-orm");
        await db.delete(schema.productImages)
            .where(inArray(schema.productImages.productId, productIds));

        await db.insert(schema.productImages).values(imageData);
    }
    console.log(`  ✅ Created/Updated ${imageData.length} product images\n`);

    // ── 5. Seed Coupons ────────────────────────────────────────────────────
    console.log("🎟️  Creating coupons...");
    await db.insert(schema.coupons).values([
        {
            code: "WELCOME10",
            discountPercent: 10,
            maxUses: 1000,
            minOrderAmount: "50.00",
            expiresAt: new Date("2027-12-31"),
        },
        {
            code: "TECHVAULT20",
            discountPercent: 20,
            maxUses: 500,
            minOrderAmount: "100.00",
            expiresAt: new Date("2027-06-30"),
        },
    ]).onConflictDoNothing();
    console.log(`  ✅ Created 2 coupons\n`);

    console.log("✅ Database seeded successfully!");
    console.log("──────────────────────────────────────");
    console.log("Admin login:  admin@techvault.com / Admin123!");
    console.log("User login:   user@techvault.com / User1234!");
    console.log("Coupon codes: WELCOME10 (10% off), TECHVAULT20 (20% off)");
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
