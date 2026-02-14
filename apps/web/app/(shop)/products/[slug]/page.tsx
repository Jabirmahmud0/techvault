"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Star,
    ShoppingCart,
    Heart,
    ChevronRight,
    Truck,
    Shield,
    RotateCcw,
    Minus,
    Plus,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartStore } from "@/lib/stores/cart-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { useProduct, type ProductImage } from "@/lib/hooks/use-products";
import { ProductReviews } from "@/components/product/product-reviews";
import { ImageGallery } from "@/components/product/image-gallery";
import { cn } from "@/lib/utils";



export default function ProductDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const resolvedParams = use(params);
    const { data: product, isLoading, error } = useProduct(resolvedParams.slug);
    const [quantity, setQuantity] = useState(1);

    const safeImage = (img: ProductImage | string | undefined | null) => {
        const url = typeof img === 'object' && img !== null ? img.url : img;
        if (!url || url === "") return "https://placehold.co/600x600?text=No+Image";
        return url;
    };

    const { addItem } = useCartStore();
    const { toggleItem, isInWishlist } = useWishlistStore();
    const wishlisted = product ? isInWishlist(product.id) : false;

    if (isLoading) {
        return (
            <div className="min-h-screen py-8 px-4">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <Skeleton className="aspect-square rounded-2xl" />
                        <div className="space-y-6">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-3/4" />
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-8 w-40" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product || error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
                    <p className="text-muted-foreground mb-4">The product you&apos;re looking for doesn&apos;t exist.</p>
                    <Button asChild>
                        <Link href="/products">Browse Products</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            productId: product.id,
            name: product.name,
            price: product.price,
            image: safeImage(product.images[0]),
            stock: product.stock,
            slug: product.slug,
            quantity,
        });
    };

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="mx-auto max-w-7xl">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                    <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                    <ChevronRight className="h-4 w-4" />
                    <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Gallery with crossfade + drag */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <ImageGallery images={product.images} alt={product.name} />
                    </motion.div>

                    {/* Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        {/* Brand + Badge */}
                        <div className="space-y-2">
                            <p className="text-sm text-primary font-medium uppercase tracking-wider">
                                {product.brand}
                            </p>
                            <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)]">
                                {product.name}
                            </h1>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-3">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "h-5 w-5",
                                            i < Math.floor(product.rating)
                                                ? "text-yellow-500 fill-yellow-500"
                                                : "text-muted-foreground/30"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {product.rating} ({product.reviewCount} reviews)
                            </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold text-primary">
                                ${Number(product.price).toFixed(2)}
                            </span>
                            {product.compareAtPrice && (
                                <>
                                    <span className="text-xl text-muted-foreground line-through">
                                        ${Number(product.compareAtPrice).toFixed(2)}
                                    </span>
                                    <span className="rounded-lg bg-destructive/10 px-2 py-0.5 text-sm font-semibold text-destructive">
                                        Save ${(Number(product.compareAtPrice) - Number(product.price)).toFixed(2)}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-muted-foreground leading-relaxed">{product.description}</p>

                        {/* Quantity + Add to Cart */}
                        <div className="flex items-center gap-4 pt-4">
                            <div className="flex items-center rounded-xl border border-border">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-r-none"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-12 text-center font-medium">{quantity}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-l-none"
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            <Button variant="glow" size="lg" className="flex-1" onClick={handleAddToCart}>
                                <ShoppingCart className="h-5 w-5" />
                                Add to Cart
                            </Button>

                            <Button
                                variant="outline"
                                size="icon"
                                className={cn("h-12 w-12", wishlisted && "border-red-500/50 bg-red-500/10")}
                                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                onClick={() =>
                                    toggleItem({
                                        id: product.id,
                                        name: product.name,
                                        slug: product.slug,
                                        price: product.price,
                                        image: safeImage(product.images[0]),
                                    })
                                }
                            >
                                <Heart className={cn("h-5 w-5", wishlisted && "fill-red-500 text-red-500")} />
                            </Button>
                        </div>

                        {/* Stock */}
                        <p className="text-sm text-muted-foreground">
                            <span className={product.stock > 5 ? "text-green-500" : "text-orange-500"}>
                                {product.stock > 5 ? "In Stock" : `Only ${product.stock} left!`}
                            </span>
                            {" · "}{product.stock} available
                        </p>

                        {/* Perks */}
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                            <div className="flex flex-col items-center gap-1 text-center">
                                <Truck className="h-5 w-5 text-primary" />
                                <span className="text-xs text-muted-foreground">Free Shipping</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 text-center">
                                <Shield className="h-5 w-5 text-primary" />
                                <span className="text-xs text-muted-foreground">2-Year Warranty</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 text-center">
                                <RotateCcw className="h-5 w-5 text-primary" />
                                <span className="text-xs text-muted-foreground">30-Day Returns</span>
                            </div>
                        </div>

                        {/* Specs Table */}
                        {product.specs && Object.keys(product.specs).length > 0 && (
                            <div className="pt-6">
                                <h2 className="text-lg font-semibold mb-4 font-[family-name:var(--font-heading)]">
                                    Specifications
                                </h2>
                                <div className="rounded-xl border border-border overflow-hidden">
                                    {Object.entries(product.specs).map(([key, value], i) => (
                                        <div
                                            key={key}
                                            className={cn(
                                                "flex items-center justify-between px-4 py-3 text-sm",
                                                i % 2 === 0 ? "bg-muted/50" : ""
                                            )}
                                        >
                                            <span className="text-muted-foreground">{key}</span>
                                            <span className="font-medium">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Reviews Section */}
                <div className="mt-16 border-t border-border pt-12">
                    <ProductReviews productId={product.id} productName={product.name} productSlug={product.slug} />
                </div>
            </div>
        </div>
    );
}
