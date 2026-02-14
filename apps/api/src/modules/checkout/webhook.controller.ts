import type { Request, Response, NextFunction } from "express";
import { eq, sql } from "drizzle-orm";
import { db } from "../../config/database.js";
import { orders, orderItems, products } from "@repo/db/schema";
import { env } from "../../config/env.js";
import { stripe } from "../../config/stripe.js";
import { emailService } from "../email/email.service.js";

/**
 * Stripe Webhook Controller
 *
 * Handles incoming Stripe webhook events with HMAC signature verification.
 * The primary event is `checkout.session.completed`, which triggers:
 *   1. Order creation in the database
 *   2. Order items creation
 *   3. Inventory (stock) decrement
 *   4. Order confirmation email
 *
 * All DB writes happen in a single transaction for ACID consistency.
 */
export const webhookController = {
    async handleStripeEvent(req: Request, res: Response, next: NextFunction) {
        const sig = req.headers["stripe-signature"];

        if (!sig) {
            console.error("⚠️ Webhook: Missing stripe-signature header");
            res.status(400).json({ error: "Missing stripe-signature header" });
            return;
        }

        let event;

        try {
            // Verify webhook signature — req.body must be raw Buffer
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err: any) {
            console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
            res.status(400).json({ error: `Webhook Error: ${err.message}` });
            return;
        }

        console.log(`✅ Webhook received: ${event.type}`);

        try {
            switch (event.type) {
                case "checkout.session.completed":
                    await handleCheckoutComplete(event.data.object);
                    break;

                default:
                    console.log(`ℹ️ Unhandled event type: ${event.type}`);
            }

            res.status(200).json({ received: true });
        } catch (error) {
            console.error("❌ Webhook handler error:", error);
            // Still return 200 to prevent Stripe from retrying
            // Log the error for manual investigation
            res.status(200).json({ received: true, error: "Handler failed" });
        }
    },
};

/**
 * Handle checkout.session.completed event.
 * Creates order, order items, and decrements stock in a single transaction.
 */
async function handleCheckoutComplete(session: any) {
    const userId = session.metadata?.userId;
    const shippingAddressRaw = session.metadata?.shippingAddress;
    const itemsRaw = session.metadata?.items;

    if (!userId || !itemsRaw) {
        console.error("❌ Webhook: Missing userId or items in session metadata");
        return;
    }

    let shippingAddress;
    let items: Array<{
        productId: string;
        productName: string;
        productImage: string;
        quantity: number;
        price: string;
    }>;

    try {
        shippingAddress = shippingAddressRaw ? JSON.parse(shippingAddressRaw) : null;
        items = JSON.parse(itemsRaw);
    } catch {
        console.error("❌ Webhook: Failed to parse metadata JSON");
        return;
    }

    // Check if order already exists for this session (idempotency)
    const existingOrder = await db.query.orders.findFirst({
        where: eq(orders.stripeSessionId, session.id),
    });

    if (existingOrder) {
        console.log(`ℹ️ Order already exists for session ${session.id}, skipping`);
        return;
    }

    const totalAmount = (session.amount_total / 100).toFixed(2); // Convert cents to dollars

    // ── All DB writes in a single transaction ────────────────────────────
    await db.transaction(async (tx) => {
        // 1. Create the order
        const [newOrder] = await tx
            .insert(orders)
            .values({
                userId,
                stripeSessionId: session.id,
                total: totalAmount,
                status: "PAID",
                shippingAddress,
            })
            .returning();

        if (!newOrder) {
            throw new Error("Failed to create order");
        }

        // 2. Create order items
        await tx.insert(orderItems).values(
            items.map((item) => ({
                orderId: newOrder.id,
                productId: item.productId,
                productName: item.productName,
                productImage: item.productImage,
                quantity: item.quantity,
                price: item.price,
            }))
        );

        // 3. Decrement inventory for each product
        for (const item of items) {
            await tx
                .update(products)
                .set({
                    stock: sql`${products.stock} - ${item.quantity}`,
                })
                .where(eq(products.id, item.productId));
        }

        console.log(`✅ Order ${newOrder.id} created with ${items.length} items`);

        // 4. Send confirmation email (fire-and-forget, don't block transaction)
        const customerEmail = session.customer_email || session.customer_details?.email;
        if (customerEmail) {
            emailService
                .sendOrderConfirmationEmail(customerEmail, newOrder.id, Number(totalAmount))
                .catch((err: unknown) => console.error("Email send failed:", err));
        }
    });
}
