import { type Request, type Response, type NextFunction } from "express";
import { sql, desc, eq, sum, count, gte } from "drizzle-orm";
import { db } from "../../config/database.js";
import { orders, users, products } from "@repo/db/schema";
import { startOfMonth, subMonths } from "date-fns";
import { settingsService } from "../settings/settings.service.js";

export const adminController = {
    async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            // Current Stats
            const [revenue] = await db
                .select({ value: sum(orders.total) })
                .from(orders)
                .where(eq(orders.status, "PAID"));

            const [ordersCount] = await db
                .select({ value: count() })
                .from(orders);

            const [usersCount] = await db
                .select({ value: count() })
                .from(users);

            const [productsCount] = await db
                .select({ value: count() })
                .from(products);

            // Trend calculations: this month vs last month
            const now = new Date();
            const thisMonthStart = startOfMonth(now);
            const lastMonthStart = startOfMonth(subMonths(now, 1));

            // This month revenue
            const [thisMonthRevenue] = await db
                .select({ value: sum(orders.total) })
                .from(orders)
                .where(sql`${orders.status} = 'PAID' AND ${orders.createdAt} >= ${thisMonthStart}`);

            // Last month revenue
            const [lastMonthRevenue] = await db
                .select({ value: sum(orders.total) })
                .from(orders)
                .where(sql`${orders.status} = 'PAID' AND ${orders.createdAt} >= ${lastMonthStart} AND ${orders.createdAt} < ${thisMonthStart}`);

            // This month orders
            const [thisMonthOrders] = await db
                .select({ value: count() })
                .from(orders)
                .where(gte(orders.createdAt, thisMonthStart));

            // Last month orders
            const [lastMonthOrders] = await db
                .select({ value: count() })
                .from(orders)
                .where(sql`${orders.createdAt} >= ${lastMonthStart} AND ${orders.createdAt} < ${thisMonthStart}`);

            // This month users
            const [thisMonthUsers] = await db
                .select({ value: count() })
                .from(users)
                .where(gte(users.createdAt, thisMonthStart));

            // Last month users
            const [lastMonthUsers] = await db
                .select({ value: count() })
                .from(users)
                .where(sql`${users.createdAt} >= ${lastMonthStart} AND ${users.createdAt} < ${thisMonthStart}`);

            const calcChange = (current: number, previous: number) => {
                if (previous === 0) return current > 0 ? 100 : 0;
                return Math.round(((current - previous) / previous) * 100);
            };

            res.json({
                success: true,
                data: {
                    revenue: Number(revenue?.value || 0),
                    orders: Number(ordersCount?.value || 0),
                    users: Number(usersCount?.value || 0),
                    products: Number(productsCount?.value || 0),
                    trends: {
                        revenue: calcChange(Number(thisMonthRevenue?.value || 0), Number(lastMonthRevenue?.value || 0)),
                        orders: calcChange(Number(thisMonthOrders?.value || 0), Number(lastMonthOrders?.value || 0)),
                        users: calcChange(Number(thisMonthUsers?.value || 0), Number(lastMonthUsers?.value || 0)),
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    },

    async getRecentOrders(req: Request, res: Response, next: NextFunction) {
        try {
            const recentOrders = await db.query.orders.findMany({
                orderBy: [desc(orders.createdAt)],
                limit: 5,
                with: {
                    user: {
                        columns: {
                            id: true,
                            name: true,
                            email: true,
                            image: true
                        }
                    },
                    items: true
                }
            });

            res.json({
                success: true,
                data: recentOrders
            });
        } catch (error) {
            next(error);
        }
    },

    async getRevenueChart(req: Request, res: Response, next: NextFunction) {
        try {
            // Group orders by date (last 30 days)
            // Using raw SQL for date truncation as direct Drizzle support varies by driver
            const result = await db.execute(sql`
                SELECT
                    to_char(created_at, 'YYYY-MM-DD') as date,
                    SUM(total) as revenue
                FROM orders
                WHERE status = 'PAID'
                AND created_at >= NOW() - INTERVAL '30 days'
                GROUP BY date
                ORDER BY date ASC
            `);

            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            next(error);
        }
    },

    async getRevenueByCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await db.execute(sql`
                SELECT
                    c.name as name,
                    SUM(oi.price * oi.quantity) as value
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                JOIN categories c ON p.category_id = c.id
                JOIN orders o ON oi.order_id = o.id
                WHERE o.status = 'PAID'
                GROUP BY c.name
                ORDER BY value DESC
                LIMIT 5
            `);

            res.json({
                success: true,
                data: result.rows.map(row => ({
                    name: row.name,
                    value: Number(row.value)
                }))
            });
        } catch (error) {
            next(error);
        }
    },

    async getLowStock(req: Request, res: Response, next: NextFunction) {
        try {
            const settings = await settingsService.getSettings();
            const threshold = settings?.lowStockThreshold || 10;

            const lowStockProducts = await db.query.products.findMany({
                where: (products, { lt, and, eq }) => and(
                    lt(products.stock, threshold),
                    eq(products.isArchived, false)
                ),
                orderBy: (products, { asc }) => [asc(products.stock)],
                limit: 5,
                columns: {
                    id: true,
                    name: true,
                    stock: true,
                    slug: true,
                },
                with: {
                    images: {
                        limit: 1,
                        orderBy: (images, { asc }) => [asc(images.sortOrder)]
                    }
                }
            });

            res.json({
                success: true,
                data: lowStockProducts
            });
        } catch (error) {
            next(error);
        }
    },

    async getCustomers(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = (req.query.search as string) || "";
            const offset = (page - 1) * limit;

            const result = await db.execute(sql`
                SELECT
                    u.id, u.name, u.email, u.image, u.role, u.created_at,
                    COUNT(o.id) as order_count,
                    COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN o.total ELSE 0 END), 0) as total_spent
                FROM users u
                LEFT JOIN orders o ON o.user_id = u.id
                WHERE u.role = 'USER'
                ${search ? sql`AND (u.name ILIKE ${'%' + search + '%'} OR u.email ILIKE ${'%' + search + '%'})` : sql``}
                GROUP BY u.id
                ORDER BY u.created_at DESC
                LIMIT ${limit} OFFSET ${offset}
            `);

            const [countResult] = await db
                .select({ value: count() })
                .from(users)
                .where(eq(users.role, "USER"));

            res.json({
                success: true,
                data: {
                    customers: result.rows.map(row => ({
                        id: row.id,
                        name: row.name,
                        email: row.email,
                        image: row.image,
                        role: row.role,
                        createdAt: row.created_at,
                        orderCount: Number(row.order_count),
                        totalSpent: Number(row.total_spent)
                    })),
                    total: Number(countResult?.value || 0),
                    page,
                    totalPages: Math.ceil(Number(countResult?.value || 0) / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    }
};
