"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { SlidersHorizontal, Grid3X3, LayoutList } from "lucide-react";
import { useState, useMemo, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { cn } from "@/lib/utils";

/** Static product data (will be replaced with API call in production) */
const allProducts = [
    { id: "1", name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max", price: 1199.99, compareAtPrice: 1299.99, image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop", rating: 4.8, reviewCount: 243, brand: "Apple", category: "smartphones", isFeatured: true },
    { id: "2", name: "MacBook Pro 16\" M3", slug: "macbook-pro-16-m3", price: 2499.99, compareAtPrice: null, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop", rating: 4.9, reviewCount: 187, brand: "Apple", category: "laptops", isFeatured: true },
    { id: "3", name: "Samsung Galaxy S24 Ultra", slug: "samsung-galaxy-s24-ultra", price: 1299.99, compareAtPrice: 1419.99, image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop", rating: 4.7, reviewCount: 156, brand: "Samsung", category: "smartphones", isFeatured: true },
    { id: "4", name: "Sony WH-1000XM5", slug: "sony-wh-1000xm5", price: 349.99, compareAtPrice: 399.99, image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=600&fit=crop", rating: 4.6, reviewCount: 412, brand: "Sony", category: "headphones", isFeatured: true },
    { id: "5", name: "iPad Pro 12.9\" M2", slug: "ipad-pro-12-9-m2", price: 1099.99, compareAtPrice: null, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop", rating: 4.8, reviewCount: 98, brand: "Apple", category: "tablets", isFeatured: true },
    { id: "6", name: "Canon EOS R6 Mark II", slug: "canon-eos-r6-mark-ii", price: 2499.99, compareAtPrice: null, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop", rating: 4.9, reviewCount: 67, brand: "Canon", category: "cameras", isFeatured: true },
    { id: "7", name: "Apple Watch Ultra 2", slug: "apple-watch-ultra-2", price: 799.99, compareAtPrice: 899.99, image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=600&fit=crop", rating: 4.7, reviewCount: 134, brand: "Apple", category: "smartwatches", isFeatured: true },
    { id: "8", name: "Dell XPS 15 OLED", slug: "dell-xps-15-oled", price: 1799.99, compareAtPrice: null, image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop", rating: 4.5, reviewCount: 89, brand: "Dell", category: "laptops", isFeatured: false },
    { id: "9", name: "Google Pixel 8 Pro", slug: "google-pixel-8-pro", price: 999.99, compareAtPrice: 1099.99, image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&fit=crop", rating: 4.6, reviewCount: 178, brand: "Google", category: "smartphones", isFeatured: false },
    { id: "10", name: "Samsung Galaxy Tab S9+", slug: "samsung-galaxy-tab-s9-plus", price: 999.99, compareAtPrice: null, image: "https://images.unsplash.com/photo-1561154464-82e9aeb32fa0?w=600&h=600&fit=crop", rating: 4.5, reviewCount: 52, brand: "Samsung", category: "tablets", isFeatured: false },
    { id: "11", name: "Sony A7 IV", slug: "sony-a7-iv", price: 2498.00, compareAtPrice: null, image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=600&fit=crop", rating: 4.8, reviewCount: 122, brand: "Sony", category: "cameras", isFeatured: false },
    { id: "12", name: "Samsung Galaxy Watch 6", slug: "samsung-galaxy-watch-6", price: 329.99, compareAtPrice: 399.99, image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&fit=crop", rating: 4.4, reviewCount: 201, brand: "Samsung", category: "smartwatches", isFeatured: false },
];

const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "rating", label: "Top Rated" },
];

const categoryFilters = [
    { value: "", label: "All" },
    { value: "smartphones", label: "Smartphones" },
    { value: "laptops", label: "Laptops" },
    { value: "tablets", label: "Tablets" },
    { value: "smartwatches", label: "Smartwatches" },
    { value: "cameras", label: "Cameras" },
    { value: "headphones", label: "Headphones" },
];

function ProductsContent() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get("category") || "";

    const [selectedCategory, setSelectedCategory] = useState(categoryParam);
    const [sort, setSort] = useState("newest");
    const [view, setView] = useState<"grid" | "list">("grid");

    const filteredProducts = useMemo(() => {
        let products = [...allProducts];

        if (selectedCategory) {
            products = products.filter((p) => p.category === selectedCategory);
        }

        switch (sort) {
            case "price_asc":
                products.sort((a, b) => a.price - b.price);
                break;
            case "price_desc":
                products.sort((a, b) => b.price - a.price);
                break;
            case "rating":
                products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            default:
                break;
        }

        return products;
    }, [selectedCategory, sort]);

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)]">
                        {selectedCategory
                            ? categoryFilters.find((c) => c.value === selectedCategory)?.label || "Products"
                            : "All Products"}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {filteredProducts.length} products found
                    </p>
                </motion.div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 rounded-xl bg-card border border-border">
                    {/* Category Chips */}
                    <div className="flex flex-wrap gap-2">
                        {categoryFilters.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value)}
                                className={cn(
                                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                                    selectedCategory === cat.value
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Sort + View Toggle */}
                    <div className="flex items-center gap-2">
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {sortOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>

                        <div className="flex rounded-lg border border-border">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn("h-8 w-8 rounded-r-none", view === "grid" && "bg-muted")}
                                onClick={() => setView("grid")}
                            >
                                <Grid3X3 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn("h-8 w-8 rounded-l-none", view === "list" && "bg-muted")}
                                onClick={() => setView("list")}
                            >
                                <LayoutList className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <motion.div
                    layout
                    className={cn(
                        "grid gap-6",
                        view === "grid"
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            : "grid-cols-1"
                    )}
                >
                    {filteredProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <ProductCard {...product} />
                        </motion.div>
                    ))}
                </motion.div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20">
                        <SlidersHorizontal className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">No products match your filters</p>
                        <Button variant="outline" className="mt-4" onClick={() => setSelectedCategory("")}>
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense>
            <ProductsContent />
        </Suspense>
    );
}
