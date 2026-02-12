import { type Request, type Response, type NextFunction } from "express";
import { db } from "../../config/database.js";
import { coupons } from "@repo/db/schema";
import { eq, desc } from "drizzle-orm";

export const couponsController = {
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const allCoupons = await db
                .select()
                .from(coupons)
                .orderBy(desc(coupons.createdAt));

            res.json({ success: true, data: allCoupons });
        } catch (error) {
            next(error);
        }
    },

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { code, discountPercent, maxUses, minOrderAmount, expiresAt, isActive } = req.body;

            const [coupon] = await db.insert(coupons).values({
                code: code.toUpperCase(),
                discountPercent,
                maxUses: maxUses || null,
                minOrderAmount: minOrderAmount || null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                isActive: isActive ?? true,
            }).returning();

            res.status(201).json({ success: true, data: coupon });
        } catch (error) {
            next(error);
        }
    },

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { code, discountPercent, maxUses, minOrderAmount, expiresAt, isActive } = req.body;

            const [updated] = await db
                .update(coupons)
                .set({
                    ...(code && { code: code.toUpperCase() }),
                    ...(discountPercent !== undefined && { discountPercent }),
                    ...(maxUses !== undefined && { maxUses }),
                    ...(minOrderAmount !== undefined && { minOrderAmount }),
                    ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
                    ...(isActive !== undefined && { isActive }),
                })
                .where(eq(coupons.id, id as string))
                .returning();

            if (!updated) {
                res.status(404).json({ success: false, error: "Coupon not found" });
                return;
            }

            res.json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    },

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const [deleted] = await db
                .delete(coupons)
                .where(eq(coupons.id, id as string))
                .returning();

            if (!deleted) {
                res.status(404).json({ success: false, error: "Coupon not found" });
                return;
            }

            res.json({ success: true, data: deleted });
        } catch (error) {
            next(error);
        }
    },
};
