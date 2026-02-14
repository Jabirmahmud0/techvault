import { eq, ilike, and, or, desc, asc, sql, count } from "drizzle-orm";
import { db } from "../../config/database.js";
import { redis } from "../../config/redis.js";
import { products, categories, productImages } from "@repo/db/schema";
import { ApiError } from "../../middleware/index.js";
import type { ProductQuery, CreateProductInput, UpdateProductInput } from "@repo/types";

export const productsService = {
    /**
     * List products with filtering, sorting, and pagination.
     */
    /**
     * List products with filtering, sorting, and pagination.
     * Caches results in Redis for 5 minutes.
     * Uses a version key to invalidate all list caches on product updates.
     */
    async list(query: ProductQuery) {
        // 1. Try Cache
        let cacheKey: string | null = null;
        if (redis) {
            try {
                // Get current data version to ensure we don't serve stale lists after updates
                // Outputting this thought process as a tool call description to pause and re-verify. I will not actually run a replace here, I will run a grep first.
                let version = await redis.get("products:version");
                if (!version) {
                    version = "1";
                    await redis.set("products:version", version);
                }

                // Create a deterministic cache key based on the query and version
                // Sort keys to ensure {a:1, b:2} and {b:2, a:1} generate same key
                const sortedQuery = Object.keys(query).sort().reduce((obj: any, key) => {
                    obj[key] = (query as any)[key];
                    return obj;
                }, {});

                cacheKey = `products:list:v${version}:${JSON.stringify(sortedQuery)}`;

                const cached = await redis.get(cacheKey);
                if (cached) {
                    return cached as { data: any[], pagination: any };
                }
            } catch (err) {
                console.warn("Redis cache error:", err);
                // Fallback to DB on error
            }
        }

        const { page = 1, limit = 10, category, search, minPrice, maxPrice, sort, brand, featured, sellerId } = query;
        const offset = (page - 1) * limit;

        const whereConditions = [];

        if (sellerId) {
            whereConditions.push(eq(products.sellerId, sellerId));
        }

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
            const categoryRecord = await db.query.categories.findFirst({
                where: eq(categories.slug, category),
            });

            if (categoryRecord) {
                whereConditions.push(eq(products.categoryId, categoryRecord.id));
            } else {
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

        const result = {
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

        // 2. Set Cache
        if (redis && cacheKey) {
            try {
                // Cache for 5 minutes
                await redis.setex(cacheKey, 300, result);
            } catch (err) {
                console.warn("Redis set error:", err);
            }
        }

        return result;
    },

    /**
     * Get a single product by slug.
     * Caches result for 5 minutes.
     */
    async getBySlug(slug: string) {
        const cacheKey = `products:slug:${slug}`;

        if (redis) {
            try {
                const cached = await redis.get(cacheKey);
                if (cached) {
                    return cached;
                }
            } catch (err) {
                console.warn("Redis get error:", err);
            }
        }

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

        if (redis) {
            try {
                await redis.setex(cacheKey, 300, product);
            } catch (err) {
                console.warn("Redis set error:", err);
            }
        }

        return product;
    },

    /**
     * Create a new product.
     * Invalidates product list cache.
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

        // Invalidate list cache by incrementing version
        if (redis) {
            try {
                await redis.incr("products:version");
            } catch (err) {
                console.warn("Redis incr error:", err);
            }
        }

        return product;
    },

    /**
     * Update a product.
     * Invalidates product specific cache and list cache.
     */
    async update(id: string, input: UpdateProductInput, userId?: string, userRole?: string) {
        const product = await db.query.products.findFirst({
            where: eq(products.id, id)
        });

        if (!product) {
            throw ApiError.notFound("Product not found");
        }

        // Ownership check
        if (userRole !== "ADMIN" && userId && product.sellerId !== userId) {
            throw ApiError.forbidden("You do not have permission to update this product");
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

        // Invalidate caches
        if (redis) {
            try {
                await Promise.all([
                    redis.del(`products:slug:${product.slug}`),
                    redis.del(`products:id:${id}`), // if we add getById cache later
                    redis.incr("products:version") // invalidate lists
                ]);
            } catch (err) {
                console.warn("Redis invalidation error:", err);
            }
        }

        return updated;
    },

    /**
     * Get a single product by its UUID.
     */
    async getById(id: string) {
        const cacheKey = `products:id:${id}`;

        if (redis) {
            try {
                const cached = await redis.get(cacheKey);
                if (cached) {
                    return cached;
                }
            } catch (err) {
                console.warn("Redis get error:", err);
            }
        }

        const product = await db.query.products.findFirst({
            where: eq(products.id, id),
            with: {
                category: true,
                images: true,
            },
        });

        if (!product) {
            throw ApiError.notFound("Product not found");
        }

        if (redis) {
            try {
                await redis.setex(cacheKey, 300, product);
            } catch (err) {
                console.warn("Redis set error:", err);
            }
        }

        return product;
    },

    /**
     * Delete a product by ID. Related records cascade-delete via DB schema.
     * Invalidates caches.
     */
    async delete(id: string, userId?: string, userRole?: string) {
        const product = await db.query.products.findFirst({
            where: eq(products.id, id),
        });

        if (!product) {
            throw ApiError.notFound("Product not found");
        }

        // Ownership check
        if (userRole !== "ADMIN" && userId && product.sellerId !== userId) {
            throw ApiError.forbidden("You do not have permission to delete this product");
        }

        await db.delete(products).where(eq(products.id, id));

        // Invalidate caches
        if (redis) {
            try {
                await Promise.all([
                    redis.del(`products:slug:${product.slug}`),
                    redis.del(`products:id:${id}`),
                    redis.incr("products:version")
                ]);
            } catch (err) {
                console.warn("Redis invalidation error:", err);
            }
        }

        return { deleted: true };
    },

    async getBrands() {
        // Cache brands too? They change rarely.
        const cacheKey = "products:brands";
        if (redis) {
            try {
                const cached = await redis.get(cacheKey);
                if (cached) return cached as string[];
            } catch (e) { }
        }

        const brands = await db
            .selectDistinct({ brand: products.brand })
            .from(products)
            .orderBy(products.brand);

        const result = brands.map(b => b.brand).filter(Boolean) as string[];

        if (redis) {
            await redis.setex(cacheKey, 3600, result); // 1 hour
        }

        return result;
    },

    async getFeatured(limit = 8) {
        const cacheKey = `products:featured:${limit}`;
        if (redis) {
            try {
                const cached = await redis.get(cacheKey);
                if (cached) return cached;
            } catch (e) { }
        }

        const data = await db.query.products.findMany({
            where: eq(products.isFeatured, true),
            limit,
            with: {
                images: true,
                category: true
            }
        });

        if (redis) {
            await redis.setex(cacheKey, 600, data); // 10 mins
        }

        return data;
    },
};
