"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { useCartStore } from "@/lib/stores/cart-store";

export default function WishlistPage() {
    const { items, removeItem, clearWishlist } = useWishlistStore();
    const { addItem } = useCartStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="mx-auto max-w-5xl">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)]">
                                <Heart className="inline h-8 w-8 text-primary fill-primary mr-2 -mt-1" />
                                Wishlist
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                {items.length} {items.length === 1 ? "item" : "items"} saved
                            </p>
                        </div>
                        {items.length > 0 && (
                            <Button variant="outline" size="sm" onClick={clearWishlist}>
                                Clear All
                            </Button>
                        )}
                    </div>
                </motion.div>

                {items.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <Heart className="h-20 w-20 text-muted-foreground/20 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
                        <p className="text-muted-foreground mb-6">
                            Start adding products you love!
                        </p>
                        <Button variant="glow" asChild>
                            <Link href="/products">
                                Browse Products <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </motion.div>
                ) : (
                    <AnimatePresence initial={false}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group overflow-hidden rounded-2xl bg-card border border-border transition-all hover:border-primary/30 hover:shadow-lg"
                                >
                                    <Link href={`/products/${item.slug}`} className="block">
                                        <div className="relative aspect-square overflow-hidden bg-muted">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </div>
                                    </Link>

                                    <div className="p-4 space-y-3">
                                        <Link
                                            href={`/products/${item.slug}`}
                                            className="text-sm font-medium hover:text-primary transition-colors line-clamp-2"
                                        >
                                            {item.name}
                                        </Link>
                                        <p className="text-lg font-bold text-primary">${Number(item.price).toFixed(2)}</p>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="glow"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() =>
                                                    addItem({
                                                        id: item.id,
                                                        productId: item.id,
                                                        name: item.name,
                                                        price: Number(item.price),
                                                        image: item.image,
                                                        stock: 99,
                                                        slug: item.slug,
                                                    })
                                                }
                                            >
                                                <ShoppingCart className="h-4 w-4" /> Add to Cart
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => removeItem(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
