import type { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "@repo/types";
import { createCheckoutSessionSchema } from "@repo/types";
import { inArray } from "drizzle-orm";
import { db } from "../../config/database.js";
import { products } from "@repo/db/schema";
import { ApiError } from "../../middleware/index.js";
import { env } from "../../config/env.js";
import { stripe } from "../../config/stripe.js";

export const checkoutController = {
    /**
     * Create a Stripe Checkout Session.
     * The order is NOT created here — it is created by the webhook
     * after Stripe confirms payment.
     */
    async createSession(req: Request, res: Response, next: NextFunction) {
        try {
            const body = createCheckoutSessionSchema.parse(req.body);
            const { items, shippingAddress } = body;
            const user = req.user as JwtPayload;

            // Filter out invalid items (e.g. old mock IDs like "5")
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const validItems = items.filter((i: any) => uuidRegex.test(i.productId));

            if (validItems.length === 0) {
                throw ApiError.badRequest("Your cart contains invalid items. Please clear your cart and add products again.");
            }

            // Verify items exist and check stock
            const productIds = validItems.map((i: any) => i.productId);
            const dbProducts = await db.query.products.findMany({
                where: inArray(products.id, productIds),
                with: { images: true },
            });

            const productMap = new Map(dbProducts.map((p) => [p.id, p]));

            const lineItems: any[] = [];
            for (const item of validItems) {
                const product = productMap.get(item.productId);
                if (!product) {
                    throw ApiError.notFound(`Product with ID ${item.productId} not found`);
                }
                if (product.stock < item.quantity) {
                    throw ApiError.badRequest(`Not enough stock for ${product.name}`);
                }

                const price = Number(product.price);
                const imageUrls = product.images.map((img) => img.url);

                lineItems.push({
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: product.name,
                            images: imageUrls.slice(0, 8), // Stripe allows max 8 images
                        },
                        unit_amount: Math.round(price * 100), // Stripe uses cents
                    },
                    quantity: item.quantity,
                });
            }

            // Create Stripe Checkout Session
            const session = await stripe.checkout.sessions.create({
                mode: "payment",
                payment_method_types: ["card"],
                line_items: lineItems,
                success_url: `${env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${env.FRONTEND_URL}/checkout/cancel`,
                customer_email: user.email,
                metadata: {
                    userId: user.userId,
                    // Keep metadata under Stripe's 500-char-per-value limit
                    shippingAddress: JSON.stringify(shippingAddress).slice(0, 500),
                    items: JSON.stringify(
                        validItems.map((item: any) => ({
                            pid: item.productId,
                            qty: item.quantity,
                            price: productMap.get(item.productId)!.price,
                        }))
                    ).slice(0, 500),
                },
            });

            res.status(200).json({
                data: {
                    url: session.url,
                    sessionId: session.id,
                },
            });
        } catch (error: any) {
            // Surface Stripe errors with useful messages instead of generic 500
            if (error?.type?.startsWith?.("Stripe") || error?.statusCode) {
                return next(ApiError.badRequest(error.message || "Payment processing failed"));
            }
            next(error);
        }
    },
};
