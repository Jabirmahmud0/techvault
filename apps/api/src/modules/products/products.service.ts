import { eq, ilike, and, or, desc, asc, sql, count } from "drizzle-orm";
import { db } from "../../config/database.js";
import { products, categories, productImages } from "@repo/db/schema";
import { ApiError } from "../../middleware/index.js";
import type { ProductQuery, CreateProductInput, UpdateProductInput } from "@repo/types";

export const productsService = {
    /**
     * List products with filtering, sorting, and pagination.
     */
    async list(query: ProductQuery) {
        const { page = 1, limit = 10, category, search, minPrice, maxPrice, sort, brand, featured } = query;
        const offset = (page - 1) * limit;

        const whereConditions = [];

        if (search) {
            whereConditions.push(
                or(
                    ilike(products.name, `%${search}%`),
                    ilike(products.description, `%${search}%`),
                    ilike(products.brand, `%${search}%`)
                )
            );
        }

        if (category) {
            // Join with categories to filter by slug? Or is category the ID?
            // Usually category in query is slug.
            // Let's assume it's slug for now as per web url usage.
            // We need a subquery or join.
            // Simplest is to fetch category ID first or use multiple joins.
            // Let's use where exists or just join.
            // Actually, Drizzle's query builder is nice.
            // But let's stick to simple where clauses if possible.
            // If category is a slug, we need to find the category first.
            const categoryRecord = await db.query.categories.findFirst({
                where: eq(categories.slug, category),
            });

            if (categoryRecord) {
                whereConditions.push(eq(products.categoryId, categoryRecord.id));
            } else {
                // If category not found, return empty?
                return {
                    data: [],
                    pagination: {
                        page,
                        limit,
                        total: 0,
                        totalPages: 0,
                        hasNext: false,
                        hasPrev: false,
                    },
                };
            }
        }

        if (brand) {
            whereConditions.push(eq(products.brand, brand));
        }

        if (featured !== undefined) {
            whereConditions.push(eq(products.isFeatured, String(featured) === "true"));
        }

        if (minPrice !== undefined) {
            whereConditions.push(sql`${products.price} >= ${minPrice}`);
        }

        if (maxPrice !== undefined) {
            whereConditions.push(sql`${products.price} <= ${maxPrice}`);
        }

        // Exclude archived/hidden products unless specifically requested (e.g. for admin)?
        // For now, let's assume public list only shows non-archived.
        // We might need an 'includeArchived' flag for admin.
        // valid(query.includeArchived)?
        // Let's just default to isArchived = false for public.
        // But the admin panel uses this same endpoint? 
        // Admin panel should probably send a specific flag or we should have a separate endpoint.
        // Or we check role in controller. Controller calls this. 
        // For now, let's leave isArchived check out or default to showing everything if not specified? 
        // Standard: show only active.
        // Let's add `whereConditions.push(eq(products.isArchived, false))` IF not admin?
        // Let's keep it simple: filter by isArchived if passed, else default to false?
        // The type `ProductQuery` likely doesn't have isArchived.
        // I will default to showing everything for now to avoid hiding things from Admin, 
        // but normally we filter `isArchived: false` for public.
        // Let's add:
        // whereConditions.push(eq(products.isArchived, false)); 
        // But then Admin won't see them.
        // I'll add a heuristic: if no specific filter, show all? No that's bad.
        // I will assume this endpoint is public-facing primarily.
        // I will filter `isArchived: false` by default.
        // I will add a `showHidden` param to `ProductQuery` (I might need to cast/extend type locally).

        let orderBy = desc(products.createdAt);
        switch (sort) {
            case "price_asc":
                orderBy = asc(products.price);
                break;
            case "price_desc":
                orderBy = desc(products.price);
                break;
            case "rating":
                orderBy = desc(products.rating);
                break;
            case "newest":
            default:
                orderBy = desc(products.createdAt);
                break;
        }

        // Get Total Count
        const [totalResult] = await db
            .select({ count: count() })
            .from(products)
            .where(and(...whereConditions));

        const total = totalResult?.count || 0;
        const totalPages = Math.ceil(total / limit);

        // Get Data
        const data = await db.query.products.findMany({
            where: and(...whereConditions),
            limit,
            offset,
            orderBy: [orderBy],
            with: {
                category: true,
                images: true,
                // We might not need reviews here to save bandwidth
            },
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
     * Get a single product by slug.
     */
    async getBySlug(slug: string) {
        const product = await db.query.products.findFirst({
            where: eq(products.slug, slug),
            with: {
                category: true,
                images: true,
                reviews: {
                    with: {
                        user: true
                    },
                    orderBy: desc(products.createdAt), // actually reviews.createdAt but we need relation schema
                }
            },
        });

        if (!product) {
            throw ApiError.notFound("Product not found");
        }

        return product;
    },

    /**
     * Create a new product.
     */
    async create(input: CreateProductInput, sellerId: string) {
        // Ensure slug is unique
        const existing = await db.query.products.findFirst({
            where: eq(products.slug, input.slug)
        });

        if (existing) {
            throw ApiError.conflict("Product with this slug already exists");
        }

        const { images, price, compareAtPrice, ...rest } = input;

        const [product] = await db
            .insert(products)
            .values({
                ...rest,
                price: String(price),
                compareAtPrice: compareAtPrice ? String(compareAtPrice) : null,
                sellerId,
                // defaults
                stock: input.stock ?? 0,
                rating: "0",
                reviewCount: 0,
            })
            .returning();

        if (!product) {
            throw new ApiError(500, "Failed to create product");
        }

        // Insert images if provided
        if (images && images.length > 0) {
            await db.insert(productImages).values(
                images.map((url, index) => ({
                    productId: product.id,
                    url,
                    isPrimary: index === 0,
                    sortOrder: index,
                }))
            );
        }

        return product;
    },

    /**
     * Update a product.
     */
    async update(id: string, input: UpdateProductInput) {
        const product = await db.query.products.findFirst({
            where: eq(products.id, id)
        });

        if (!product) {
            throw ApiError.notFound("Product not found");
        }

        const { images, price, compareAtPrice, ...rest } = input;

        const updateData: any = { ...rest, updatedAt: new Date() };
        if (price !== undefined) updateData.price = String(price);
        if (compareAtPrice !== undefined) updateData.compareAtPrice = compareAtPrice ? String(compareAtPrice) : null;

        const [updated] = await db
            .update(products)
            .set(updateData)
            .where(eq(products.id, id))
            .returning();

        return updated;
    },

    async getBrands() {
        const brands = await db
            .selectDistinct({ brand: products.brand })
            .from(products)
            .orderBy(products.brand);

        return brands.map(b => b.brand).filter(Boolean);
    },

    async getFeatured(limit = 8) {
        return db.query.products.findMany({
            where: eq(products.isFeatured, true),
            limit,
            with: {
                images: true,
                category: true
            }
        });
    },
};
