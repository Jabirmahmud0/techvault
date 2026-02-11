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
import { useCartStore } from "@/lib/stores/cart-store";
import { cn } from "@/lib/utils";

/** Static product lookup (will be replaced with API/DB call) */
const productsMap: Record<string, {
    id: string; name: string; slug: string; price: number; compareAtPrice?: number;
    images: string[]; description: string; specs: Record<string, string>;
    rating: number; reviewCount: number; brand: string; category: string;
    stock: number; isFeatured: boolean;
}> = {
    "iphone-15-pro-max": {
        id: "1", name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max", price: 1199.99,
        compareAtPrice: 1299.99,
        images: [
            "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=800&fit=crop",
        ],
        description: "The iPhone 15 Pro Max features a stunning 6.7-inch Super Retina XDR display, A17 Pro chip, 48MP camera system with 5x optical zoom, and titanium design. Experience the most powerful iPhone ever made.",
        specs: { Display: "6.7\" OLED", Chip: "A17 Pro", Storage: "256GB", Camera: "48MP + 12MP + 12MP", Battery: "4422 mAh", OS: "iOS 17" },
        rating: 4.8, reviewCount: 243, brand: "Apple", category: "Smartphones", stock: 15, isFeatured: true,
    },
    "macbook-pro-16-m3": {
        id: "2", name: "MacBook Pro 16\" M3 Max", slug: "macbook-pro-16-m3", price: 2499.99,
        images: [
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&h=800&fit=crop",
        ],
        description: "The MacBook Pro 16-inch with M3 Max delivers extraordinary performance for pro workflows. With up to 128GB unified memory and a stunning Liquid Retina XDR display.",
        specs: { Display: "16.2\" Liquid Retina XDR", Chip: "M3 Max", RAM: "36GB", Storage: "1TB SSD", Battery: "22h", Weight: "2.14 kg" },
        rating: 4.9, reviewCount: 187, brand: "Apple", category: "Laptops", stock: 8, isFeatured: true,
    },
    "samsung-galaxy-s24-ultra": {
        id: "3", name: "Samsung Galaxy S24 Ultra", slug: "samsung-galaxy-s24-ultra", price: 1299.99,
        compareAtPrice: 1419.99,
        images: [
            "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&h=800&fit=crop",
        ],
        description: "Galaxy S24 Ultra with Galaxy AI. The ultimate smartphone experience with a 200MP camera, S Pen, titanium frame, and powerful Snapdragon 8 Gen 3 processor.",
        specs: { Display: "6.8\" Dynamic AMOLED 2X", Chip: "Snapdragon 8 Gen 3", Storage: "256GB", Camera: "200MP + 12MP + 50MP + 10MP", Battery: "5000 mAh", OS: "Android 14" },
        rating: 4.7, reviewCount: 156, brand: "Samsung", category: "Smartphones", stock: 22, isFeatured: true,
    },
};

export default function ProductDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const resolvedParams = use(params);
    const product = productsMap[resolvedParams.slug];
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const { addItem } = useCartStore();

    if (!product) {
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
            image: product.images[0]!,
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
                    {/* Image Gallery */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        {/* Main Image */}
                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted border border-border">
                            <Image
                                src={product.images[selectedImage]!}
                                alt={product.name}
                                fill
                                priority
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover"
                            />
                        </div>

                        {/* Thumbnails */}
                        {product.images.length > 1 && (
                            <div className="flex gap-3">
                                {product.images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={cn(
                                            "relative h-20 w-20 overflow-hidden rounded-xl border-2 transition-all",
                                            selectedImage === i
                                                ? "border-primary ring-2 ring-primary/20"
                                                : "border-border hover:border-muted-foreground"
                                        )}
                                    >
                                        <Image src={img} alt="" fill sizes="80px" className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
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
                                ${product.price.toFixed(2)}
                            </span>
                            {product.compareAtPrice && (
                                <>
                                    <span className="text-xl text-muted-foreground line-through">
                                        ${product.compareAtPrice.toFixed(2)}
                                    </span>
                                    <span className="rounded-lg bg-destructive/10 px-2 py-0.5 text-sm font-semibold text-destructive">
                                        Save ${(product.compareAtPrice - product.price).toFixed(2)}
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

                            <Button variant="outline" size="icon" className="h-12 w-12" aria-label="Add to wishlist">
                                <Heart className="h-5 w-5" />
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
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
