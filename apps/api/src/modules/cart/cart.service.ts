import { eq, and } from "drizzle-orm";
import { cartItems, products } from "@repo/db/schema";
import { db } from "../../config/database.js";
import { ApiError } from "../../middleware/index.js";
import type { AddToCartInput, UpdateCartItemInput } from "@repo/types";

export const cartService = {
    /**
     * Get all cart items for a user with product details.
     */
    async getCart(userId: string) {
        return db.query.cartItems.findMany({
            where: eq(cartItems.userId, userId),
            with: {
                product: {
                    with: { images: true },
                },
            },
            orderBy: (cartItems, { desc }) => [desc(cartItems.createdAt)],
        });
    },

    /**
     * Add item to cart or increment quantity if already exists.
     */
    async addItem(userId: string, input: AddToCartInput) {
        // Check product exists and is in stock
        const product = await db.query.products.findFirst({
            where: eq(products.id, input.productId),
        });

        if (!product) {
            throw ApiError.notFound("Product not found");
        }
        if (product.stock < input.quantity) {
            throw ApiError.badRequest(`Only ${product.stock} items available in stock`);
        }

        // Check if item already in cart
        const existing = await db.query.cartItems.findFirst({
            where: and(
                eq(cartItems.userId, userId),
                eq(cartItems.productId, input.productId)
            ),
        });

        if (existing) {
            const newQuantity = existing.quantity + input.quantity;
            if (newQuantity > product.stock) {
                throw ApiError.badRequest(`Cannot add more. Only ${product.stock} available.`);
            }

            const [updated] = await db
                .update(cartItems)
                .set({ quantity: newQuantity })
                .where(eq(cartItems.id, existing.id))
                .returning();

            return updated;
        }

        const [item] = await db
            .insert(cartItems)
            .values({
                userId,
                productId: input.productId,
                quantity: input.quantity,
            })
            .returning();

        return item;
    },

    /**
     * Update cart item quantity.
     */
    async updateItem(userId: string, itemId: string, input: UpdateCartItemInput) {
        const item = await db.query.cartItems.findFirst({
            where: and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)),
        });

        if (!item) {
            throw ApiError.notFound("Cart item not found");
        }

        // Check stock
        const product = await db.query.products.findFirst({
            where: eq(products.id, item.productId),
        });

        if (product && input.quantity > product.stock) {
            throw ApiError.badRequest(`Only ${product.stock} items available`);
        }

        const [updated] = await db
            .update(cartItems)
            .set({ quantity: input.quantity })
            .where(eq(cartItems.id, itemId))
            .returning();

        return updated;
    },

    /**
     * Remove a specific item from the cart.
     */
    async removeItem(userId: string, itemId: string) {
        const item = await db.query.cartItems.findFirst({
            where: and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)),
        });

        if (!item) {
            throw ApiError.notFound("Cart item not found");
        }

        await db.delete(cartItems).where(eq(cartItems.id, itemId));
        return { message: "Item removed from cart" };
    },

    /**
     * Clear all items from the user's cart.
     */
    async clearCart(userId: string) {
        await db.delete(cartItems).where(eq(cartItems.userId, userId));
        return { message: "Cart cleared" };
    },

    /**
     * Get cart item count for badge display.
     */
    async getCount(userId: string) {
        const items = await db.query.cartItems.findMany({
            where: eq(cartItems.userId, userId),
            columns: { quantity: true },
        });
        return items.reduce((sum, item) => sum + item.quantity, 0);
    },
};
