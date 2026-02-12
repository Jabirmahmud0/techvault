import { eq, desc, and, ilike, or, sql, count } from "drizzle-orm";
import { db } from "../../config/database.js";
import { orders, orderItems, users } from "@repo/db/schema";
import { ApiError } from "../../middleware/index.js";

export const ordersService = {
    /**
     * List authenticated user's orders
     */
    async listUserOrders(userId: string) {
        return db.query.orders.findMany({
            where: eq(orders.userId, userId),
            orderBy: [desc(orders.createdAt)],
            with: {
                items: true
            }
        });
    },

    /**
     * Get single order details.
     * If userId is provided, ensures the order belongs to that user.
     * If isAdmin is true, skips ownership check.
     */
    async getOrder(id: string, userId?: string | null, isAdmin = false) {
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, id),
            with: {
                items: true,
                user: true // Include user details for admin view
            }
        });

        if (!order) {
            throw ApiError.notFound("Order not found");
        }

        // Authorization check
        if (!isAdmin && userId && order.userId !== userId) {
            throw ApiError.forbidden("You do not have permission to view this order");
        }

        return order;
    },

    /**
     * List all orders (Admin).
     * Supports pagination, search, status filtering.
     */
    async listAllOrders(query: { page?: number; limit?: number; search?: string; status?: string }) {
        const { page = 1, limit = 10, search, status } = query;
        const offset = (page - 1) * limit;

        const whereConditions = [];

        if (status) {
            // @ts-expect-error - status enum vs string
            whereConditions.push(eq(orders.status, status));
        }

        if (search) {
            // Search by Order ID, User Name, or User Email
            // We need to join with users table for name/email search
            // Drizzle query builder 'findMany' handles relations but filtering on relations in 'where' 
            // is tricky with 'findMany' API directly if not using 'eq' on foreign key.
            // But we can use 'exists' or just standard query builder.
            // Let's use standard query builder for complex filtering?
            // Or just filter simply by ID for now if search is UUID?
            // If search is text, maybe we search stripesessionid?

            // Let's assume search can be Order ID or Stripe Session ID for now.
            // Implementing user name search requires joining.
            // For simplicity in this step, let's search by ID or Stripe ID.
            whereConditions.push(
                or(
                    // ilike(orders.id, `%${search}%`), // UUIDs usually don't work well with ilike if strict
                    // just use eq if it's a UUID?
                    // Let's try to cast to text if needed.
                    ilike(orders.stripeSessionId, `%${search}%`)
                )
            );
        }

        const [totalResult] = await db
            .select({ count: count() })
            .from(orders)
            .where(and(...whereConditions));

        const total = totalResult?.count || 0;
        const totalPages = Math.ceil(total / limit);

        const data = await db.query.orders.findMany({
            where: and(...whereConditions),
            limit,
            offset,
            orderBy: [desc(orders.createdAt)],
            with: {
                user: true,
                items: true
            }
        });

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    },

    /**
     * Update order status (Admin).
     */
    async updateStatus(id: string, status: string) {
        // Validate status
        if (!["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"].includes(status)) {
            throw ApiError.badRequest("Invalid status");
        }

        const [updated] = await db
            .update(orders)
            .set({
                status: status as any,
                updatedAt: new Date()
            })
            .where(eq(orders.id, id))
            .returning();

        if (!updated) {
            throw ApiError.notFound("Order not found");
        }

        return updated;
    }
};
