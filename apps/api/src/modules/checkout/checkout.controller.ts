import type { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "@repo/types";
import { createCheckoutSessionSchema } from "@repo/types";
import { inArray } from "drizzle-orm";
import { db } from "../../config/database.js";
import { orders, orderItems, products } from "@repo/db/schema";
import { ApiError } from "../../middleware/index.js";
import { env } from "../../config/env.js";
import { emailService } from "../email/email.service.js";

export const checkoutController = {
    /**
     * Create a checkout session (Mocked for now)
     */
    async createSession(req: Request, res: Response, next: NextFunction) {
        try {
            const body = createCheckoutSessionSchema.parse(req.body);
            const { items, shippingAddress } = body;
            const user = req.user as JwtPayload;

            // Verify items and calculate total
            // Filter out invalid items (e.g. old mock IDs like "5")
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const validItems = items.filter((i: any) => uuidRegex.test(i.productId));

            if (validItems.length === 0) {
                throw ApiError.badRequest("Your cart contains invalid items. Please clear your cart and add products again.");
            }

            const productIds = validItems.map((i: any) => i.productId);
            const dbProducts = await db.query.products.findMany({
                where: inArray(products.id, productIds),
                with: {
                    images: true
                }
            });

            const productMap = new Map(dbProducts.map((p) => [p.id, p]));

            let total = 0;
            const lineItems = [];
            const dbOrderItems = [];

            for (const item of items) {
                const product = productMap.get(item.productId);
                if (!product) {
                    throw ApiError.notFound(`Product with ID ${item.productId} not found`);
                }

                if (product.stock < item.quantity) {
                    throw ApiError.badRequest(`Not enough stock for ${product.name}`);
                }

                const price = Number(product.price);
                total += price * item.quantity;
                const imageUrls = product.images.map((img) => img.url);

                lineItems.push({
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: product.name,
                            images: imageUrls,
                        },
                        unit_amount: Math.round(price * 100),
                    },
                    quantity: item.quantity,
                });

                dbOrderItems.push({
                    productId: product.id,
                    productName: product.name,
                    productImage: imageUrls[0] || "",
                    quantity: item.quantity,
                    price: product.price, // Already string in DB schema, but typed as string|number in some ORM contexts? No, schema says decimal -> string
                });
            }

            // MOCK STRIPE SESSION
            // In a real app, we would call Stripe here.
            // const session = await stripe.checkout.sessions.create({...})

            const mockSessionId = `sess_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;

            // Create Pending Order in DB
            const [newOrder] = await db.insert(orders).values({
                userId: user.userId, // User is guaranteed by auth middleware
                stripeSessionId: mockSessionId,
                total: total.toString(),
                status: "PAID", // Auto-pay for mock flow
                shippingAddress: shippingAddress,
            }).returning();

            if (!newOrder) {
                throw new Error("Failed to create order");
            }

            // Send order confirmation email (async)
            const userEmail = user.email;
            if (userEmail) {
                emailService.sendOrderConfirmation(userEmail, newOrder.id, total.toString()).catch(console.error);
            }

            // Create Order Items
            if (dbOrderItems.length > 0) {
                await db.insert(orderItems).values(
                    dbOrderItems.map(item => ({
                        orderId: newOrder.id,
                        productId: item.productId,
                        productName: item.productName,
                        productImage: item.productImage,
                        quantity: item.quantity,
                        price: item.price
                    }))
                );
            }

            // Simulate a success URL (normally Stripe returns this)
            // We'll redirect to our success page with the session_id
            const successUrl = `${env.FRONTEND_URL}/checkout/success?session_id=${mockSessionId}`;

            res.status(200).json({
                data: {
                    url: successUrl,
                    sessionId: mockSessionId
                }
            });

        } catch (error) {
            next(error);
        }
    },
};
