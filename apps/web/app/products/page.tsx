"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { SlidersHorizontal, Grid3X3, LayoutList } from "lucide-react";
import { useState, useMemo, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { cn } from "@/lib/utils";

import { useProducts } from "@/lib/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";

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

    const { data, isLoading } = useProducts({
        category: selectedCategory,
        sort,
    });

    const products = data?.data || [];

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
                        {products.length} products found
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
                {isLoading ? (
                    <div className={cn(
                        "grid gap-6",
                        view === "grid"
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            : "grid-cols-1"
                    )}>
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="flex flex-col space-y-3">
                                <Skeleton className="h-[300px] w-full rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        layout
                        className={cn(
                            "grid gap-6",
                            view === "grid"
                                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                : "grid-cols-1"
                        )}
                    >
                        {products.map((product, index) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <ProductCard
                                    id={product.id}
                                    name={product.name}
                                    slug={product.slug}
                                    price={product.price}
                                    compareAtPrice={product.compareAtPrice}
                                    image={
                                        product.images?.find((img) => img.isPrimary)?.url
                                        || product.images?.[0]?.url
                                        || "/placeholder.png"
                                    }
                                    rating={product.rating}
                                    reviewCount={product.reviewCount}
                                    brand={product.brand}
                                    category={product.category?.name}
                                    isFeatured={product.isFeatured}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {!isLoading && products.length === 0 && (
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
