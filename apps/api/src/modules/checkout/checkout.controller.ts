import type { Request, Response, NextFunction } from "express";
import { products } from "../products/products.data.js";
import { db } from "../../config/database.js";
import { orders, orderItems } from "@repo/db/schema";
import { ApiError } from "../../middleware/index.js";
import { env } from "../../config/env.js";
import { emailService } from "../email/email.service.js";

export const checkoutController = {
    /**
     * Create a checkout session (Mocked for now)
     */
    async createSession(req: Request, res: Response, next: NextFunction) {
        try {
            const { items } = req.body;
            const user = req.user;

            if (!items || !Array.isArray(items) || items.length === 0) {
                throw ApiError.badRequest("Cart is empty");
            }

            // Verify items and calculate total
            let total = 0;
            const lineItems = [];
            const dbOrderItems = [];

            for (const item of items) {
                const product = products.find((p) => p.id === item.productId);
                if (!product) {
                    throw ApiError.notFound(`Product with ID ${item.productId} not found`);
                }

                if (product.stock < item.quantity) {
                    throw ApiError.badRequest(`Not enough stock for ${product.name}`);
                }

                total += product.price * item.quantity;

                lineItems.push({
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: product.name,
                            images: product.images,
                        },
                        unit_amount: Math.round(product.price * 100),
                    },
                    quantity: item.quantity,
                });

                dbOrderItems.push({
                    productId: product.id,
                    productName: product.name,
                    productImage: product.images[0],
                    quantity: item.quantity,
                    price: product.price.toString(), // Store as string for decimal
                });
            }

            // MOCK STRIPE SESSION
            // In a real app, we would call Stripe here.
            // const session = await stripe.checkout.sessions.create({...})

            const mockSessionId = `sess_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;

            // Create Pending Order in DB
            const [newOrder] = await db.insert(orders).values({
                userId: (user as any).id, // User is guaranteed by auth middleware
                stripeSessionId: mockSessionId,
                total: total.toString(),
                status: "PAID", // Auto-pay for mock flow
            }).returning();

            if (!newOrder) {
                throw new Error("Failed to create order");
            }

            // Send order confirmation email (async)
            const userEmail = (user as any).email;
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
