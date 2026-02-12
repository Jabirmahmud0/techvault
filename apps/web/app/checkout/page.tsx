"use client";

import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    CreditCard,
    Lock,
    ShoppingBag,
    Truck,
    Shield,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shippingAddressSchema, ShippingAddress } from "@repo/types";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cart-store";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

/**
 * Checkout page with order summary and shipping/payment form.
 */
export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCartStore();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const subtotal = totalPrice();
    const shipping = subtotal > 50 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const form = useForm<ShippingAddress>({
        resolver: zodResolver(shippingAddressSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            address: "",
            city: "",
            zip: "",
            country: "US",
        },
    });

    const onSubmit = async (values: ShippingAddress) => {
        setLoading(true);

        try {
            const res = await api.post<{ data: { url: string } }>("/checkout", {
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                })),
                shippingAddress: values,
            });

            if (res.data?.url) {
                const url = res.data.url;
                if (url.startsWith("http")) {
                    window.location.href = url;
                } else {
                    router.push(url);
                }
            }
        } catch (error: any) {
            console.error("Checkout validation failed", error);
            const message = error.message || "Something went wrong";

            if (message.includes("invalid items")) {
                toast.error("Cart contained invalid items and has been cleared. Please add products again.");
                clearCart();
                router.push("/products");
            } else {
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
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
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Shipping Information */}
                                <div className="rounded-2xl border border-border bg-card p-6">
                                    <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)] flex items-center gap-2 mb-4">
                                        <Truck className="h-5 w-5 text-primary" /> Shipping Information
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>First Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="John" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Last Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Doe" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="sm:col-span-2">
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="john@example.com" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <FormField
                                                control={form.control}
                                                name="address"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Address</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="123 Main St" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="city"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>City</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="New York" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="zip"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>ZIP Code</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="10001" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Payment Information - Static for now as it's mocked */}
                                <div className="rounded-2xl border border-border bg-card p-6">
                                    <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)] flex items-center gap-2 mb-4">
                                        <CreditCard className="h-5 w-5 text-primary" /> Payment
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="sm:col-span-2 space-y-2">
                                            <label htmlFor="cardNumber" className="text-sm font-medium">Card Number</label>
                                            <input id="cardNumber" type="text" placeholder="4242 4242 4242 4242"
                                                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="expiry" className="text-sm font-medium">Expiry</label>
                                            <input id="expiry" type="text" placeholder="MM/YY"
                                                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="cvc" className="text-sm font-medium">CVC</label>
                                            <input id="cvc" type="text" placeholder="123"
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
                        </Form>
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
