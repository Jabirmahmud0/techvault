import { eq, desc, and, avg, count, sql } from "drizzle-orm";
import { db } from "../../config/database.js";
import { redis } from "../../config/redis.js";
import { productReviews, users, products, orders, orderItems } from "@repo/db/schema";
import { ApiError } from "../../middleware/index.js";
import type { CreateReviewInput } from "@repo/types";

export const reviewsService = {
    /** List reviews for a product with user info. */
    async listByProduct(productId: string, page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        const [reviews, [totalRow], [avgRow]] = await Promise.all([
            db
                .select({
                    id: productReviews.id,
                    rating: productReviews.rating,
                    comment: productReviews.comment,
                    createdAt: productReviews.createdAt,
                    userName: users.name,
                    userImage: users.image,
                })
                .from(productReviews)
                .innerJoin(users, eq(productReviews.userId, users.id))
                .where(eq(productReviews.productId, productId))
                .orderBy(desc(productReviews.createdAt))
                .limit(limit)
                .offset(offset),
            db
                .select({ total: count() })
                .from(productReviews)
                .where(eq(productReviews.productId, productId)),
            db
                .select({ avg: avg(productReviews.rating) })
                .from(productReviews)
                .where(eq(productReviews.productId, productId)),
        ]);

        const total = totalRow?.total ?? 0;
        const averageRating = avgRow?.avg ? parseFloat(String(avgRow.avg)) : 0;

        return {
            reviews,
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews: total,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
        };
    },

    /** Get rating breakdown (1-5 star counts) for a product. */
    async getRatingBreakdown(productId: string) {
        const rows = await db
            .select({
                rating: productReviews.rating,
                count: count(),
            })
            .from(productReviews)
            .where(eq(productReviews.productId, productId))
            .groupBy(productReviews.rating);

        const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        for (const row of rows) {
            breakdown[row.rating] = row.count;
        }
        return breakdown;
    },

    /** Create a review. One review per user per product. */
    async create(input: CreateReviewInput, userId: string) {
        // Check if product exists
        const [product] = await db
            .select({ id: products.id })
            .from(products)
            .where(eq(products.id, input.productId))
            .limit(1);

        if (!product) throw new ApiError(404, "Product not found");

        // Check for existing review
        const [existing] = await db
            .select({ id: productReviews.id })
            .from(productReviews)
            .where(
                and(
                    eq(productReviews.productId, input.productId),
                    eq(productReviews.userId, userId)
                )
            )
            .limit(1);

        if (existing) throw new ApiError(409, "You have already reviewed this product");

        // Check if user has purchased the product
        const [purchase] = await db
            .select({ id: orders.id })
            .from(orders)
            .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
            .where(
                and(
                    eq(orders.userId, userId),
                    eq(orderItems.productId, input.productId),
                    eq(orders.status, "PAID")
                )
            )
            .limit(1);

        if (!purchase) {
            throw new ApiError(403, "You can only review products you have purchased");
        }

        const [review] = await db
            .insert(productReviews)
            .values({
                productId: input.productId,
                userId,
                rating: input.rating,
                comment: input.comment,
                isVerifiedPurchase: true,
            })
            .returning();

        // Update product stats
        await this.updateProductStats(input.productId);

        return review;
    },

    /** Delete own review. */
    async delete(reviewId: string, userId: string) {
        const [review] = await db
            .select({ id: productReviews.id, userId: productReviews.userId, productId: productReviews.productId })
            .from(productReviews)
            .where(eq(productReviews.id, reviewId))
            .limit(1);

        if (!review) throw new ApiError(404, "Review not found");
        if (review.userId !== userId) throw new ApiError(403, "Not authorized");

        await db.delete(productReviews).where(eq(productReviews.id, reviewId));

        // Update product stats
        await this.updateProductStats(review.productId);

        return { success: true };
    },

    /**
     * Recalculate and update product rating and review count.
     * Invalidates product cache.
     */
    async updateProductStats(productId: string) {
        const [stats] = await db
            .select({
                count: count(),
                avgRating: avg(productReviews.rating)
            })
            .from(productReviews)
            .where(eq(productReviews.productId, productId));

        const reviewCount = stats?.count || 0;
        const rating = stats?.avgRating ? String(Number(stats.avgRating).toFixed(1)) : "0";

        await db
            .update(products)
            .set({
                reviewCount,
                rating,
                updatedAt: new Date()
            })
            .where(eq(products.id, productId));

        // Invalidate caches
        if (redis) {
            try {
                // We need the product slug to invalidate the slug cache
                const [product] = await db
                    .select({ slug: products.slug })
                    .from(products)
                    .where(eq(products.id, productId))
                    .limit(1);

                const keys = [
                    `products:id:${productId}`,
                    "products:version", // Invalidate lists
                ];

                if (product?.slug) {
                    keys.push(`products:slug:${product.slug}`);
                }

                await Promise.all(keys.map(key => redis!.del(key)));
                // Also increment version for lists
                await redis!.incr("products:version");
            } catch (err) {
                console.warn("Redis invalidation error:", err);
            }
        }
    }
};
