"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";

/** Static product data for searching (will be replaced with API call) */
const searchableProducts = [
    { id: "1", name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max", price: 1199.99, image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&h=200&fit=crop", brand: "Apple", category: "Smartphones" },
    { id: "2", name: "MacBook Pro 16\" M3", slug: "macbook-pro-16-m3", price: 2499.99, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop", brand: "Apple", category: "Laptops" },
    { id: "3", name: "Samsung Galaxy S24 Ultra", slug: "samsung-galaxy-s24-ultra", price: 1299.99, image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200&h=200&fit=crop", brand: "Samsung", category: "Smartphones" },
    { id: "4", name: "Sony WH-1000XM5", slug: "sony-wh-1000xm5", price: 349.99, image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=200&h=200&fit=crop", brand: "Sony", category: "Headphones" },
    { id: "5", name: "iPad Pro 12.9\" M2", slug: "ipad-pro-12-9-m2", price: 1099.99, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200&h=200&fit=crop", brand: "Apple", category: "Tablets" },
    { id: "6", name: "Canon EOS R6 Mark II", slug: "canon-eos-r6-mark-ii", price: 2499.99, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&h=200&fit=crop", brand: "Canon", category: "Cameras" },
    { id: "7", name: "Apple Watch Ultra 2", slug: "apple-watch-ultra-2", price: 799.99, image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=200&h=200&fit=crop", brand: "Apple", category: "Smartwatches" },
    { id: "8", name: "Dell XPS 15 OLED", slug: "dell-xps-15-oled", price: 1799.99, image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=200&h=200&fit=crop", brand: "Dell", category: "Laptops" },
    { id: "9", name: "Google Pixel 8 Pro", slug: "google-pixel-8-pro", price: 999.99, image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&h=200&fit=crop", brand: "Google", category: "Smartphones" },
    { id: "10", name: "Samsung Galaxy Tab S9+", slug: "samsung-galaxy-tab-s9-plus", price: 999.99, image: "https://images.unsplash.com/photo-1561154464-82e9aeb32fa0?w=200&h=200&fit=crop", brand: "Samsung", category: "Tablets" },
    { id: "11", name: "Sony A7 IV", slug: "sony-a7-iv", price: 2498.00, image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=200&h=200&fit=crop", brand: "Sony", category: "Cameras" },
    { id: "12", name: "Samsung Galaxy Watch 6", slug: "samsung-galaxy-watch-6", price: 329.99, image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200&h=200&fit=crop", brand: "Samsung", category: "Smartwatches" },
];

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setQuery("");
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    const results = query.trim().length > 0
        ? searchableProducts.filter(
            (p) =>
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.brand.toLowerCase().includes(query.toLowerCase()) ||
                p.category.toLowerCase().includes(query.toLowerCase())
        )
        : [];

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
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 350 }}
                        className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2"
                    >
                        <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
                            {/* Input */}
                            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search products, brands, categories..."
                                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                />
                                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Results */}
                            <div className="max-h-80 overflow-y-auto p-2">
                                {query.trim().length === 0 ? (
                                    <div className="py-8 text-center text-sm text-muted-foreground">
                                        Start typing to search...
                                    </div>
                                ) : results.length === 0 ? (
                                    <div className="py-8 text-center text-sm text-muted-foreground">
                                        No products found for &ldquo;{query}&rdquo;
                                    </div>
                                ) : (
                                    results.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/products/${product.slug}`}
                                            onClick={onClose}
                                            className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted"
                                        >
                                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                                                <Image src={product.image} alt={product.name} fill sizes="48px" className="object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                                                <p className="text-xs text-muted-foreground">{product.brand} · {product.category}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-semibold text-primary">${product.price.toFixed(2)}</p>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {results.length > 0 && (
                                <div className="border-t border-border px-4 py-3">
                                    <Link
                                        href={`/products?search=${encodeURIComponent(query)}`}
                                        onClick={onClose}
                                        className="flex items-center justify-center gap-1 text-sm font-medium text-primary hover:underline"
                                    >
                                        View all results <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
