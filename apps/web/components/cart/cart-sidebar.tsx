"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cart-store";

/**
 * Slide-in cart sidebar with item list, quantity controls, and checkout CTA.
 */
export function CartSidebar() {
    const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } =
        useCartStore();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        onClick={closeCart}
                    />

                    {/* Sidebar Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-card border-l border-border shadow-2xl"
                        id="cart-sidebar"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-border p-4">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)]">
                                    Your Cart
                                </h2>
                                <span className="text-sm text-muted-foreground">
                                    ({items.length} {items.length === 1 ? "item" : "items"})
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={closeCart}
                                aria-label="Close cart"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
                                    <p className="text-muted-foreground mb-2">Your cart is empty</p>
                                    <Button variant="outline" onClick={closeCart} asChild>
                                        <Link href="/products">Browse Products</Link>
                                    </Button>
                                </div>
                            ) : (
                                <AnimatePresence initial={false}>
                                    {items.map((item, index) => (
                                        <motion.div
                                            key={item.productId}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20, height: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex gap-4 rounded-xl bg-muted/50 p-3"
                                        >
                                            {/* Product Image */}
                                            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="80px"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex flex-1 flex-col justify-between min-w-0">
                                                <div>
                                                    <Link
                                                        href={`/products/${item.slug}`}
                                                        className="text-sm font-medium hover:text-primary transition-colors line-clamp-1"
                                                        onClick={closeCart}
                                                    >
                                                        {item.name}
                                                    </Link>
                                                    <p className="text-sm font-semibold text-primary mt-0.5">
                                                        ${Number(item.price).toFixed(2)}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() =>
                                                                updateQuantity(item.productId, item.quantity - 1)
                                                            }
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="text-sm w-6 text-center font-medium">
                                                            {item.quantity}
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() =>
                                                                updateQuantity(item.productId, item.quantity + 1)
                                                            }
                                                            disabled={item.quantity >= item.stock}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>

                                                    {/* Remove */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                                        onClick={() => removeItem(item.productId)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>

                        {/* Footer / Checkout */}
                        {items.length > 0 && (
                            <div className="border-t border-border p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Subtotal</span>
                                    <span className="text-lg font-bold">${Number(totalPrice()).toFixed(2)}</span>
                                </div>
                                <Button
                                    variant="glow"
                                    size="lg"
                                    className="w-full"
                                    asChild
                                    onClick={closeCart}
                                >
                                    <Link href="/checkout">Proceed to Checkout</Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-muted-foreground"
                                    onClick={closeCart}
                                    asChild
                                >
                                    <Link href="/products">Continue Shopping</Link>
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
