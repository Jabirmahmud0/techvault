import { eq, ilike, and, gte, lte, desc, asc, sql, count } from "drizzle-orm";
import { products, productImages, categories } from "@repo/db/schema";
import { db } from "../../config/database.js";
import { ApiError } from "../../middleware/index.js";
import type { ProductQuery, CreateProductInput, UpdateProductInput } from "@repo/types";

export const productsService = {
    /**
     * List products with filtering, sorting, and pagination.
     */
    async list(query: ProductQuery) {
        const { page, limit, category, search, minPrice, maxPrice, sort, brand, featured } = query;
        const offset = (page - 1) * limit;

        // Build dynamic where conditions
        const conditions = [eq(products.isArchived, false)];

        if (search) {
            conditions.push(ilike(products.name, `%${search}%`));
        }
        if (brand) {
            conditions.push(eq(products.brand, brand));
        }
        if (featured !== undefined) {
            conditions.push(eq(products.isFeatured, featured));
        }
        if (minPrice !== undefined) {
            conditions.push(gte(products.price, String(minPrice)));
        }
        if (maxPrice !== undefined) {
            conditions.push(lte(products.price, String(maxPrice)));
        }

        // Category filter by slug
        let categoryId: string | undefined;
        if (category) {
            const cat = await db.query.categories.findFirst({
                where: eq(categories.slug, category),
            });
            if (cat) {
                categoryId = cat.id;
                conditions.push(eq(products.categoryId, categoryId));
            }
        }

        const whereClause = and(...conditions);

        // Sort order
        const orderBy = (() => {
            switch (sort) {
                case "price_asc": return asc(products.price);
                case "price_desc": return desc(products.price);
                case "rating": return desc(products.rating);
                case "name": return asc(products.name);
                case "newest":
                default: return desc(products.createdAt);
            }
        })();

        // Parallel: fetch data + count
        const [data, totalResult] = await Promise.all([
            db.query.products.findMany({
                where: whereClause,
                orderBy: [orderBy],
                limit,
                offset,
                with: {
                    images: true,
                    category: true,
                },
            }),
            db.select({ count: count() }).from(products).where(whereClause),
        ]);

        const total = totalResult[0]?.count ?? 0;
        const totalPages = Math.ceil(total / limit);

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
     * Get a single product by slug, including images, category, and reviews.
     */
    async getBySlug(slug: string) {
        const product = await db.query.products.findFirst({
            where: eq(products.slug, slug),
            with: {
                images: true,
                category: true,
                reviews: {
                    with: { user: true },
                    orderBy: [desc(sql`created_at`)],
                    limit: 10,
                },
            },
        });

        if (!product) {
            throw ApiError.notFound("Product not found");
        }

        return product;
    },

    /**
     * Create a new product (admin/seller only).
     */
    async create(input: CreateProductInput, sellerId: string) {
        // Check for duplicate slug
        const existing = await db.query.products.findFirst({
            where: eq(products.slug, input.slug),
        });
        if (existing) {
            throw ApiError.conflict("A product with this slug already exists");
        }

        const [product] = await db
            .insert(products)
            .values({
                ...input,
                price: String(input.price),
                compareAtPrice: input.compareAtPrice ? String(input.compareAtPrice) : undefined,
                sellerId,
            })
            .returning();

        return product;
    },

    /**
     * Update a product by ID (admin/seller only).
     */
    async update(id: string, input: UpdateProductInput) {
        const existing = await db.query.products.findFirst({
            where: eq(products.id, id),
        });
        if (!existing) {
            throw ApiError.notFound("Product not found");
        }

        const updateData: Record<string, unknown> = { ...input, updatedAt: new Date() };
        if (input.price !== undefined) updateData.price = String(input.price);
        if (input.compareAtPrice !== undefined) updateData.compareAtPrice = String(input.compareAtPrice);

        const [updated] = await db
            .update(products)
            .set(updateData)
            .where(eq(products.id, id))
            .returning();

        return updated;
    },

    /**
     * Get all unique brands for filter sidebar.
     */
    async getBrands() {
        const result = await db
            .selectDistinct({ brand: products.brand })
            .from(products)
            .where(and(eq(products.isArchived, false), sql`${products.brand} IS NOT NULL`));

        return result.map((r) => r.brand).filter(Boolean);
    },

    /**
     * Get featured products for the homepage.
     */
    async getFeatured(limit = 8) {
        return db.query.products.findMany({
            where: and(eq(products.isFeatured, true), eq(products.isArchived, false)),
            with: { images: true, category: true },
            orderBy: [desc(products.createdAt)],
            limit,
        });
    },
};
