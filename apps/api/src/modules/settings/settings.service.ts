import { db } from "../../config/database.js";
import { settings } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { UpdateSettingsInput } from "@repo/types";

export const settingsService = {
    /**
     * Get current settings.
     * If no settings exist, returns default values (handled by schema defaults or frontend).
     * Actually, let's ensure one row always exists or return defaults here.
     */
    async getSettings() {
        const existing = await db.query.settings.findFirst();

        if (!existing) {
            // Create default settings if none exist
            const [defaults] = await db.insert(settings).values({
                storeName: "TechVault",
                storeEmail: "admin@techvault.com",
                currency: "USD",
                taxRate: "0",
                shippingFee: "0",
                lowStockThreshold: 10
            }).returning();
            return defaults;
        }

        return existing;
    },

    /**
     * Update settings.
     * Upserts the single settings row.
     */
    async updateSettings(data: UpdateSettingsInput) {
        const existing = await db.query.settings.findFirst();

        const formattedData = {
            ...data,
            taxRate: data.taxRate.toString(),
            shippingFee: data.shippingFee.toString(),
            freeShippingThreshold: data.freeShippingThreshold?.toString(),
            // lowStockThreshold is integer, so number is fine
        };

        if (existing) {
            const [updated] = await db
                .update(settings)
                .set({
                    ...formattedData,
                    updatedAt: new Date()
                })
                .where(eq(settings.id, existing.id))
                .returning();
            return updated;
        } else {
            // Should not happen if getSettings is called first, but handle safe upsert
            const [created] = await db.insert(settings).values({
                ...formattedData,
                storeName: data.storeName || "TechVault",
                storeEmail: data.storeEmail || "admin@techvault.com",
                currency: data.currency || "USD",
                lowStockThreshold: data.lowStockThreshold || 10,
                taxRate: formattedData.taxRate || "0",
                shippingFee: formattedData.shippingFee || "0",
            }).returning();
            return created;
        }
    }
};
