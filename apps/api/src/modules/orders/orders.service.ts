import { eq, desc, and, ilike, or, sql, count } from "drizzle-orm";
import { db } from "../../config/database.js";
import { orders, orderItems, users, products } from "@repo/db/schema";
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
     * List orders containing products from a specific seller.
     */
    async listSellerOrders(sellerId: string, query: { page?: number; limit?: number; search?: string; status?: string }) {
        const { page = 1, limit = 10, search, status } = query;
        const offset = (page - 1) * limit;

        // Find relevant order IDs via join
        const sellerOrderIdsResult = await db
            .selectDistinct({ id: orders.id })
            .from(orders)
            .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
            .innerJoin(products, eq(orderItems.productId, products.id))
            .where(and(
                eq(products.sellerId, sellerId),
                status ? eq(orders.status, status as any) : undefined
            ));

        const sellerOrderIds = sellerOrderIdsResult.map(o => o.id);

        if (sellerOrderIds.length === 0) {
            return {
                data: [],
                pagination: {
                    page,
                    limit,
                    total: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false,
                }
            };
        }

        const total = sellerOrderIds.length;
        const totalPages = Math.ceil(total / limit);

        // Simple finding does not support convenient pagination on IDs if we did it in memory
        // But since we fetched all IDs, we can slice.
        // For production with millions of orders this is bad, but for MVP it's fine.
        const paginatedIds = sellerOrderIds.slice(offset, offset + limit);

        if (paginatedIds.length === 0) {
            return {
                data: [],
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: false,
                    hasPrev: page > 1,
                }
            };
        }

        const data = await db.query.orders.findMany({
            where: (orders, { inArray }) => inArray(orders.id, paginatedIds),
            orderBy: [desc(orders.createdAt)],
            with: {
                user: true,
                items: {
                    with: {
                        product: true
                    }
                }
            }
        });

        // Filter items to only show those belonging to the seller
        const dataWithFilteredItems = data.map(order => ({
            ...order,
            items: order.items.filter(item => item.product.sellerId === sellerId)
        }));

        return {
            data: dataWithFilteredItems,
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
     * Get seller dashboard statistics.
     */
    async getSellerStats(sellerId: string) {
        // 1. Total Revenue (sum of items sold by this seller in PAID/SHIPPED/DELIVERED orders)
        const revenueResult = await db
            .select({
                total: sql<number>`sum(${orderItems.price} * ${orderItems.quantity})`
            })
            .from(orderItems)
            .innerJoin(orders, eq(orderItems.orderId, orders.id))
            .innerJoin(products, eq(orderItems.productId, products.id))
            .where(and(
                eq(products.sellerId, sellerId),
                or(
                    eq(orders.status, "PAID"),
                    eq(orders.status, "SHIPPED"),
                    eq(orders.status, "DELIVERED")
                )
            ));

        const totalRevenue = Number(revenueResult[0]?.total || 0);

        // 2. Total Orders (distinct orders containing seller's products)
        const ordersResult = await db
            .selectDistinct({ id: orders.id })
            .from(orders)
            .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
            .innerJoin(products, eq(orderItems.productId, products.id))
            .where(eq(products.sellerId, sellerId));

        const totalOrders = ordersResult.length;

        // 3. Total Products (count of products owned by seller)
        const productsResult = await db
            .select({ count: count() })
            .from(products)
            .where(eq(products.sellerId, sellerId));

        const totalProducts = productsResult[0]?.count || 0;

        // 4. Pending Orders (Active Now equivalent - orders needing attention)
        const pendingOrdersResult = await db
            .selectDistinct({ id: orders.id })
            .from(orders)
            .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
            .innerJoin(products, eq(orderItems.productId, products.id))
            .where(and(
                eq(products.sellerId, sellerId),
                eq(orders.status, "PAID") // Paid but not shipped yet
            ));

        const pendingOrders = pendingOrdersResult.length;

        return {
            totalRevenue,
            totalOrders,
            totalProducts,
            pendingOrders
        };
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
    async updateStatus(id: string, status: string, userId: string, role: string) {
        // Validate status
        if (!["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"].includes(status)) {
            throw ApiError.badRequest("Invalid status");
        }

        const order = await db.query.orders.findFirst({
            where: eq(orders.id, id),
            with: {
                items: {
                    with: {
                        product: true
                    }
                }
            }
        });

        if (!order) {
            throw ApiError.notFound("Order not found");
        }

        // Authorization check for Seller
        if (role === "SELLER") {
            const hasSellerItems = order.items.some(item => item.product.sellerId === userId);
            if (!hasSellerItems) {
                throw ApiError.forbidden("You do not have permission to update this order");
            }
        }

        // Update status
        const [updated] = await db
            .update(orders)
            .set({
                status: status as any,
                updatedAt: new Date()
            })
            .where(eq(orders.id, id))
            .returning();

        return updated;
    }
};
