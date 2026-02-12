import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hash } from "bcrypt";
import dotenv from "dotenv";
import * as schema from "./schema";

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

    console.log(`  ✅ Admin: admin@techvault.com / Admin123!`);
    console.log(`  ✅ User: user@techvault.com / User1234!\n`);

    // ── 2. Seed Categories ─────────────────────────────────────────────────
    console.log("📂 Creating categories...");
    const categoryData = [
        { name: "Smartphones", slug: "smartphones", description: "Latest smartphones and mobile devices", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400" },
        { name: "Laptops", slug: "laptops", description: "Powerful laptops for work and gaming", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400" },
        { name: "Tablets", slug: "tablets", description: "Tablets for productivity and entertainment", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400" },
        { name: "Smartwatches", slug: "smartwatches", description: "Wearable tech and smartwatches", image: "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=400" },
        { name: "Cameras", slug: "cameras", description: "Digital cameras and photography gear", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400" },
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
        },
        {
            name: "Google Pixel 9 Pro",
            slug: "google-pixel-9-pro",
            description: "The best of Google AI in a beautifully designed phone. Tensor G4 chip, incredible camera system, and 7 years of OS updates.",
            shortDescription: "Google AI. Tensor G4. Pro camera.",
            price: "999.99",
            stock: 52,
            sku: "GOOG-PX9P-128",
            brand: "Google",
            categoryId: categoryMap["smartphones"]!,
            sellerId: admin!.id,
            isFeatured: false,
            specifications: JSON.stringify({ display: "6.3-inch LTPO OLED", chip: "Tensor G4", storage: "128GB", camera: "50MP + 48MP + 48MP", battery: "4700 mAh" }),
        },
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
        },
        // Laptops
        {
            name: 'MacBook Pro 16" M3 Max',
            slug: "macbook-pro-16-m3-max",
            description: "The most powerful MacBook Pro ever. M3 Max chip with up to 128GB unified memory, stunning Liquid Retina XDR display, and all-day battery life for pro workflows.",
            shortDescription: "M3 Max. 128GB unified memory. All-day battery.",
            price: "3499.99",
            compareAtPrice: "3699.99",
            stock: 15,
            sku: "APPL-MBP16-M3M",
            brand: "Apple",
            categoryId: categoryMap["laptops"]!,
            sellerId: admin!.id,
            isFeatured: true,
            specifications: JSON.stringify({ display: '16.2-inch Liquid Retina XDR', chip: "Apple M3 Max", memory: "36GB", storage: "1TB SSD", battery: "22 hours" }),
        },
        {
            name: "Dell XPS 15",
            slug: "dell-xps-15",
            description: "A stunning 15.6-inch InfinityEdge display with Intel Core Ultra processors. Precision-crafted with premium materials for the ultimate productivity machine.",
            shortDescription: "InfinityEdge display. Intel Core Ultra.",
            price: "1899.99",
            stock: 28,
            sku: "DELL-XPS15-512",
            brand: "Dell",
            categoryId: categoryMap["laptops"]!,
            sellerId: admin!.id,
            isFeatured: true,
            specifications: JSON.stringify({ display: '15.6-inch OLED 3.5K', processor: "Intel Core Ultra 9", memory: "32GB DDR5", storage: "512GB SSD", battery: "13 hours" }),
        },
        {
            name: "ASUS ROG Strix G16",
            slug: "asus-rog-strix-g16",
            description: "Built for gaming dominance. RTX 4070 graphics, Intel Core i9 processor, 240Hz refresh rate display, and advanced cooling for sustained performance.",
            shortDescription: "RTX 4070. 240Hz display. Gaming powerhouse.",
            price: "1699.99",
            compareAtPrice: "1899.99",
            stock: 22,
            sku: "ASUS-ROGG16",
            brand: "ASUS",
            categoryId: categoryMap["laptops"]!,
            sellerId: admin!.id,
            isFeatured: false,
            specifications: JSON.stringify({ display: '16-inch IPS 240Hz', processor: "Intel Core i9-14900HX", gpu: "NVIDIA RTX 4070", memory: "16GB DDR5", storage: "1TB SSD" }),
        },
        {
            name: "ThinkPad X1 Carbon Gen 12",
            slug: "thinkpad-x1-carbon-gen12",
            description: "The legendary ThinkPad reimagined. Ultra-light carbon fiber chassis, Intel Core Ultra vPro, and the best keyboard in the business.",
            shortDescription: "Ultra-light. vPro security. Best-in-class keyboard.",
            price: "1649.99",
            stock: 35,
            sku: "LEN-X1C-G12",
            brand: "Lenovo",
            categoryId: categoryMap["laptops"]!,
            sellerId: admin!.id,
            isFeatured: false,
            specifications: JSON.stringify({ display: '14-inch 2.8K OLED', processor: "Intel Core Ultra 7 vPro", memory: "32GB LPDDR5x", storage: "512GB SSD", weight: "1.09 kg" }),
        },
        // Tablets
        {
            name: 'iPad Pro 13" M4',
            slug: "ipad-pro-13-m4",
            description: "The thinnest, most powerful iPad ever. M4 chip, tandem OLED Ultra Retina XDR display, and the new Apple Pencil Pro for creative professionals.",
            shortDescription: "M4 chip. Tandem OLED. Apple Pencil Pro.",
            price: "1299.99",
            stock: 30,
            sku: "APPL-IPADP13-M4",
            brand: "Apple",
            categoryId: categoryMap["tablets"]!,
            sellerId: admin!.id,
            isFeatured: true,
            specifications: JSON.stringify({ display: '13-inch Ultra Retina XDR', chip: "Apple M4", storage: "256GB", connectivity: "Wi-Fi 6E", weight: "579 g" }),
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
        },
        // Smartwatches
        {
            name: "Apple Watch Ultra 2",
            slug: "apple-watch-ultra-2",
            description: "The most rugged and capable Apple Watch ever. Titanium case, precision dual-frequency GPS, up to 36 hours battery life, and depth gauge for diving.",
            shortDescription: "Titanium. 36hr battery. Precision GPS.",
            price: "799.99",
            stock: 40,
            sku: "APPL-AWU2-49",
            brand: "Apple",
            categoryId: categoryMap["smartwatches"]!,
            sellerId: admin!.id,
            isFeatured: true,
            specifications: JSON.stringify({ display: "49mm Always-On Retina", chip: "S9 SiP", battery: "36 hours", waterResistance: "100m", gps: "Dual-frequency L1/L5" }),
        },
        {
            name: "Samsung Galaxy Watch 6 Classic",
            slug: "samsung-galaxy-watch-6-classic",
            description: "Classic design meets cutting-edge tech. Rotating bezel, sapphire crystal display, advanced health monitoring with BioActive Sensor.",
            shortDescription: "Rotating bezel. Sapphire crystal. Health tracking.",
            price: "399.99",
            compareAtPrice: "449.99",
            stock: 55,
            sku: "SAM-GW6C-47",
            brand: "Samsung",
            categoryId: categoryMap["smartwatches"]!,
            sellerId: admin!.id,
            isFeatured: false,
            specifications: JSON.stringify({ display: "47mm Super AMOLED", chip: "Exynos W930", battery: "425 mAh", waterResistance: "5ATM+IP68", os: "Wear OS 4" }),
        },
        {
            name: "Garmin Fenix 7X Pro",
            slug: "garmin-fenix-7x-pro",
            description: "The ultimate adventure smartwatch. Solar charging, multi-band GPS, built-in flashlight, and over 30 built-in sport apps for athletes and explorers.",
            shortDescription: "Solar charging. Multi-band GPS. Built-in flashlight.",
            price: "899.99",
            stock: 18,
            sku: "GAR-F7XP-51",
            brand: "Garmin",
            categoryId: categoryMap["smartwatches"]!,
            sellerId: admin!.id,
            isFeatured: false,
            specifications: JSON.stringify({ display: "51mm MIP", battery: "Up to 37 days", gps: "Multi-band GNSS", waterResistance: "10ATM", solar: "Power Glass" }),
        },
        // Cameras
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
            isFeatured: true,
            specifications: JSON.stringify({ sensor: "61MP Full-Frame Exmor R", autofocus: "759-point AI AF", video: "8K 24p / 4K 120p", stabilization: "8-stop IBIS", evf: "9.44M-dot OLED" }),
        },
        {
            name: "Canon EOS R5 Mark II",
            slug: "canon-eos-r5-mark-ii",
            description: "45MP full-frame mirrorless powerhouse with Dual Pixel CMOS AF II, 8K raw video, and professional-grade build quality.",
            shortDescription: "45MP. Dual Pixel AF II. 8K RAW.",
            price: "4299.99",
            stock: 8,
            sku: "CAN-R5MII",
            brand: "Canon",
            categoryId: categoryMap["cameras"]!,
            sellerId: admin!.id,
            isFeatured: false,
            specifications: JSON.stringify({ sensor: "45MP Full-Frame CMOS", autofocus: "Dual Pixel CMOS AF II", video: "8K RAW 30p / 4K 120p", stabilization: "8.5-stop IBIS", evf: "5.76M-dot OLED" }),
        },
        {
            name: "Fujifilm X-T5",
            slug: "fujifilm-x-t5",
            description: "40MP APS-C mirrorless with legendary Fuji color science, retro design, and 7-stop IBIS. The photographer's camera.",
            shortDescription: "40MP. Fuji colors. Retro design.",
            price: "1699.99",
            stock: 20,
            sku: "FUJI-XT5",
            brand: "Fujifilm",
            categoryId: categoryMap["cameras"]!,
            sellerId: admin!.id,
            isFeatured: false,
            specifications: JSON.stringify({ sensor: "40MP APS-C X-Trans CMOS 5 HR", autofocus: "425-point hybrid AF", video: "6.2K 30p / 4K 60p", stabilization: "7-stop IBIS", filmSimulations: "19 modes" }),
        },
        {
            name: "Nikon Z8",
            slug: "nikon-z8",
            description: "45.7MP full-frame mirrorless in a compact body. Borrowed tech from the flagship Z9 with 8K video, subject detection AF, and zero blackout EVF.",
            shortDescription: "45.7MP. Z9 tech. Compact body.",
            price: "3999.99",
            stock: 10,
            sku: "NIK-Z8",
            brand: "Nikon",
            categoryId: categoryMap["cameras"]!,
            sellerId: admin!.id,
            isFeatured: false,
            specifications: JSON.stringify({ sensor: "45.7MP Full-Frame Stacked CMOS", autofocus: "Subject Detection AF", video: "8K 30p / 4K 120p", stabilization: "6-stop IBIS", evf: "3.69M-dot" }),
        },
    ];

    const insertedProducts = await db
        .insert(schema.products)
        .values(productData)
        .onConflictDoNothing()
        .returning();

    console.log(`  ✅ Created ${insertedProducts.length} products\n`);

    // ── 4. Seed Product Images ─────────────────────────────────────────────
    console.log("🖼️  Creating product images...");
    const imageData = insertedProducts.map((product) => ({
        productId: product.id,
        url: `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80`,
        altText: product.name,
        isPrimary: true,
        sortOrder: 0,
    }));

    if (imageData.length > 0) {
        await db.insert(schema.productImages).values(imageData).onConflictDoNothing();
    }
    console.log(`  ✅ Created ${imageData.length} product images\n`);

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
