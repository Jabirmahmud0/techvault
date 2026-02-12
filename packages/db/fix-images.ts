import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
import * as schema from "./src/schema";

dotenv.config({ path: "../../.env" });

const imageMap: Record<string, string> = {
    "iphone-15-pro-max": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop",
    "samsung-galaxy-s24-ultra": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop",
    "google-pixel-9-pro": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&fit=crop",
    "oneplus-12": "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&h=600&fit=crop",
    "macbook-pro-16-m3-max": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop",
    "dell-xps-15": "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop",
    "asus-rog-strix-g16": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&h=600&fit=crop",
    "thinkpad-x1-carbon-gen12": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&h=600&fit=crop",
    "ipad-pro-13-m4": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop",
    "samsung-galaxy-tab-s9-ultra": "https://images.unsplash.com/photo-1561154464-82e9aeb32fa0?w=600&h=600&fit=crop",
    "apple-watch-ultra-2": "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=600&fit=crop",
    "samsung-galaxy-watch-6-classic": "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&fit=crop",
    "garmin-fenix-7x-pro": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
    "sony-a7r-v": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop",
    "canon-eos-r5-mark-ii": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=600&fit=crop",
    "fujifilm-x-t5": "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=600&h=600&fit=crop",
    "nikon-z8": "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=600&h=600&fit=crop",
};

async function fixImages() {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql, { schema });

    console.log("🖼️  Fixing product images...\n");

    const products = await db.query.products.findMany();

    for (const product of products) {
        const newUrl = imageMap[product.slug];
        if (!newUrl) {
            console.log(`  ⚠️  No image mapping for: ${product.slug}`);
            continue;
        }

        await db
            .update(schema.productImages)
            .set({ url: newUrl })
            .where(eq(schema.productImages.productId, product.id));

        console.log(`  ✅ ${product.name} → updated`);
    }

    console.log("\n✅ All product images updated!");
}

fixImages().catch(console.error);
