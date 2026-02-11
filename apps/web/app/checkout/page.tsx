"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    CreditCard,
    Lock,
    ShoppingBag,
    Truck,
    Shield,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cart-store";

/**
 * Checkout page with order summary and shipping/payment form.
 */
export default function CheckoutPage() {
    const { items, totalPrice } = useCartStore();
    const [loading, setLoading] = useState(false);

    const subtotal = totalPrice();
    const shipping = subtotal > 50 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // TODO: integrate Stripe Checkout
        setTimeout(() => setLoading(false), 2000);
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
                    <p className="text-muted-foreground mb-6">Add some products before checking out.</p>
                    <Button variant="glow" asChild>
                        <Link href="/products">Browse Products</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="mx-auto max-w-6xl">
                {/* Back Link */}
                <Link
                    href="/products"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                    <ArrowLeft className="h-4 w-4" /> Continue Shopping
                </Link>

                <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] mb-8">
                    Checkout
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Form — 3 columns */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3 space-y-6"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Shipping Information */}
                            <div className="rounded-2xl border border-border bg-card p-6">
                                <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)] flex items-center gap-2 mb-4">
                                    <Truck className="h-5 w-5 text-primary" /> Shipping Information
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                                        <input id="firstName" type="text" required placeholder="John"
                                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                                        <input id="lastName" type="text" required placeholder="Doe"
                                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                                    </div>
                                    <div className="sm:col-span-2 space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                                        <input id="email" type="email" required placeholder="john@example.com"
                                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                                    </div>
                                    <div className="sm:col-span-2 space-y-2">
                                        <label htmlFor="address" className="text-sm font-medium">Address</label>
                                        <input id="address" type="text" required placeholder="123 Main St"
                                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="city" className="text-sm font-medium">City</label>
                                        <input id="city" type="text" required placeholder="New York"
                                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="zip" className="text-sm font-medium">ZIP Code</label>
                                        <input id="zip" type="text" required placeholder="10001"
                                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="rounded-2xl border border-border bg-card p-6">
                                <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)] flex items-center gap-2 mb-4">
                                    <CreditCard className="h-5 w-5 text-primary" /> Payment
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2 space-y-2">
                                        <label htmlFor="cardNumber" className="text-sm font-medium">Card Number</label>
                                        <input id="cardNumber" type="text" required placeholder="4242 4242 4242 4242"
                                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="expiry" className="text-sm font-medium">Expiry</label>
                                        <input id="expiry" type="text" required placeholder="MM/YY"
                                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="cvc" className="text-sm font-medium">CVC</label>
                                        <input id="cvc" type="text" required placeholder="123"
                                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                                    <Lock className="h-3.5 w-3.5" />
                                    Secured with 256-bit SSL encryption
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="glow"
                                size="xl"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
                            </Button>
                        </form>
                    </motion.div>

                    {/* Order Summary — 2 columns */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2"
                    >
                        <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 space-y-4">
                            <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)] flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5 text-primary" /> Order Summary
                            </h2>

                            {/* Items */}
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {items.map((item) => (
                                    <div key={item.productId} className="flex items-center gap-3">
                                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                                            <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 pt-4 border-t border-border text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className={shipping === 0 ? "text-green-500 font-medium" : ""}>
                                        {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax (8%)</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-border text-base font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Trust badges */}
                            <div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Shield className="h-3.5 w-3.5 text-green-500" /> Secure
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Truck className="h-3.5 w-3.5 text-blue-500" /> Fast Delivery
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
