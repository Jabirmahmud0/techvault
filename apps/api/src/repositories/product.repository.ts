import { db } from "../config/database.js";
import { eq, and, sql, ilike, desc, asc, SQL } from "drizzle-orm";
import * as schema from "@repo/db/schema";

/**
 * Product repository — data access layer for products table.
 * Separates database queries from business logic in the service layer.
 */
export const productRepository = {
    /** Find product by ID */
    async findById(id: string) {
        const [product] = await db
            .select()
            .from(schema.products)
            .where(eq(schema.products.id, id))
            .limit(1);
        return product ?? null;
    },

    /** Find product by slug */
    async findBySlug(slug: string) {
        const [product] = await db
            .select()
            .from(schema.products)
            .where(eq(schema.products.slug, slug))
            .limit(1);
        return product ?? null;
    },

    /** Find products with filters, sorting, and pagination */
    async findMany(opts: {
        categoryId?: string;
        sellerId?: string;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
        sort?: string;
        page?: number;
        limit?: number;
        isFeatured?: boolean;
    }) {
        const {
            categoryId,
            sellerId,
            search,
            minPrice,
            maxPrice,
            sort = "newest",
            page = 1,
            limit = 12,
            isFeatured,
        } = opts;

        const conditions: SQL[] = [];

        if (categoryId) conditions.push(eq(schema.products.categoryId, categoryId));
        if (sellerId) conditions.push(eq(schema.products.sellerId, sellerId));
        if (isFeatured) conditions.push(eq(schema.products.isFeatured, true));
        if (search) conditions.push(ilike(schema.products.name, `%${search}%`));
        if (minPrice !== undefined) conditions.push(sql`${schema.products.price} >= ${minPrice}`);
        if (maxPrice !== undefined) conditions.push(sql`${schema.products.price} <= ${maxPrice}`);

        const where = conditions.length > 0 ? and(...conditions) : undefined;

        let orderBy;
        switch (sort) {
            case "price_asc":
                orderBy = asc(schema.products.price);
                break;
            case "price_desc":
                orderBy = desc(schema.products.price);
                break;
            case "name_asc":
                orderBy = asc(schema.products.name);
                break;
            case "rating":
                orderBy = desc(schema.products.rating);
                break;
            case "newest":
            default:
                orderBy = desc(schema.products.createdAt);
                break;
        }

        const offset = (page - 1) * limit;

        const [items, countResult] = await Promise.all([
            db
                .select()
                .from(schema.products)
                .where(where)
                .orderBy(orderBy)
                .limit(limit)
                .offset(offset),
            db
                .select({ count: sql<number>`count(*)` })
                .from(schema.products)
                .where(where),
        ]);

        return {
            items,
            total: Number(countResult[0]?.count ?? 0),
            page,
            limit,
            totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
        };
    },

    /** Create a product */
    async create(data: typeof schema.products.$inferInsert) {
        const [product] = await db.insert(schema.products).values(data).returning();
        return product;
    },

    /** Update a product */
    async update(id: string, data: Partial<typeof schema.products.$inferInsert>) {
        const [product] = await db
            .update(schema.products)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(schema.products.id, id))
            .returning();
        return product ?? null;
    },

    /** Delete a product */
    async delete(id: string) {
        await db.delete(schema.products).where(eq(schema.products.id, id));
    },
};
