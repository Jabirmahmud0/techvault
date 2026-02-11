"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cart-store";
import { cn } from "@/lib/utils";

interface ProductCardProps {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number | null;
    image: string;
    rating?: number | null;
    reviewCount?: number;
    brand?: string | null;
    category?: string;
    isFeatured?: boolean;
}

/**
 * Product card with hover effects, add-to-cart, and quick-view overlay.
 */
export function ProductCard({
    id,
    name,
    slug,
    price,
    compareAtPrice,
    image,
    rating,
    reviewCount = 0,
    brand,
    category,
    isFeatured,
}: ProductCardProps) {
    const { addItem } = useCartStore();

    const discount =
        compareAtPrice && compareAtPrice > price
            ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
            : null;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addItem({
            id,
            productId: id,
            name,
            price,
            image,
            stock: 99,
            slug,
        });
    };

    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group"
        >
            <Link
                href={`/products/${slug}`}
                className="block overflow-hidden rounded-2xl bg-card border border-border transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                id={`product-card-${slug}`}
            >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                        src={image}
                        alt={name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {discount && (
                            <span className="rounded-lg bg-destructive px-2.5 py-1 text-xs font-bold text-white">
                                -{discount}%
                            </span>
                        )}
                        {isFeatured && (
                            <span className="rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-white">
                                Featured
                            </span>
                        )}
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-white/90 text-foreground hover:bg-white"
                            onClick={handleAddToCart}
                            aria-label="Add to cart"
                        >
                            <ShoppingCart className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-white/90 text-foreground hover:bg-white"
                            aria-label="Quick view"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                    {(brand || category) && (
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                            {brand || category}
                        </p>
                    )}

                    <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {name}
                    </h3>

                    {/* Rating */}
                    {rating != null && (
                        <div className="flex items-center gap-1">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "h-3.5 w-3.5",
                                            i < Math.floor(rating)
                                                ? "text-yellow-500 fill-yellow-500"
                                                : "text-muted-foreground/30"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                                ({reviewCount})
                            </span>
                        </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">
                            ${price.toFixed(2)}
                        </span>
                        {compareAtPrice && compareAtPrice > price && (
                            <span className="text-sm text-muted-foreground line-through">
                                ${compareAtPrice.toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
