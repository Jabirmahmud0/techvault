import type { Request, Response, NextFunction } from "express";
import { db } from "../../config/database.js";
import { orders, orderItems } from "@repo/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { ApiError } from "../../middleware/index.js";

export const ordersController = {
    /**
     * List authenticated user's orders
     */
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user;

            const userOrders = await db.query.orders.findMany({
                where: eq(orders.userId, (user as any).id),
                orderBy: [desc(orders.createdAt)],
                with: {
                    items: true
                }
            });

            res.json({
                data: userOrders
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Get single order details
     */
    async get(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user;
            const { id } = req.params;

            if (!id) {
                throw ApiError.badRequest("Order ID is required");
            }

            const order = await db.query.orders.findFirst({
                where: and(
                    eq(orders.id, id as string),
                    eq(orders.userId, (user as any).id)
                ),
                with: {
                    items: true
                }
            });

            if (!order) {
                throw ApiError.notFound("Order not found");
            }

            res.json({
                data: order
            });
        } catch (error) {
            next(error);
        }
    }
};
