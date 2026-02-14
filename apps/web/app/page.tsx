"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Shield,
  Truck,
  Headphones,
  Smartphone,
  Laptop,
  Watch,
  Camera,
  Tablet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { HeroParallax } from "@/components/ui/hero-parallax";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

/** Placeholder featured products for server-rendered homepage */
const featuredProducts = [
  {
    id: "1", name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max", price: 1199.99,
    compareAtPrice: 1299.99, image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop",
    rating: 4.8, reviewCount: 243, brand: "Apple", isFeatured: true,
  },
  {
    id: "2", name: "MacBook Pro 16\" M3", slug: "macbook-pro-16-m3", price: 2499.99,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop",
    rating: 4.9, reviewCount: 187, brand: "Apple", isFeatured: true,
  },
  {
    id: "3", name: "Samsung Galaxy S24 Ultra", slug: "samsung-galaxy-s24-ultra", price: 1299.99,
    compareAtPrice: 1419.99, image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop",
    rating: 4.7, reviewCount: 156, brand: "Samsung", isFeatured: true,
  },
  {
    id: "4", name: "Sony WH-1000XM5", slug: "sony-wh-1000xm5", price: 349.99,
    compareAtPrice: 399.99, image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=600&fit=crop",
    rating: 4.6, reviewCount: 412, brand: "Sony", isFeatured: true,
  },
  {
    id: "5", name: "iPad Pro 12.9\" M2", slug: "ipad-pro-12-9-m2", price: 1099.99,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop",
    rating: 4.8, reviewCount: 98, brand: "Apple", isFeatured: true,
  },
  {
    id: "6", name: "Canon EOS R6 Mark II", slug: "canon-eos-r6-mark-ii", price: 2499.99,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop",
    rating: 4.9, reviewCount: 67, brand: "Canon", isFeatured: true,
  },
  {
    id: "7", name: "Apple Watch Ultra 2", slug: "apple-watch-ultra-2", price: 799.99,
    compareAtPrice: 899.99, image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=600&fit=crop",
    rating: 4.7, reviewCount: 134, brand: "Apple", isFeatured: true,
  },
  {
    id: "8", name: "Dell XPS 15 OLED", slug: "dell-xps-15-oled", price: 1799.99,
    image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop",
    rating: 4.5, reviewCount: 89, brand: "Dell", isFeatured: true,
  },
];

// Map featured products for the hero parallax component
const parallaxProducts = featuredProducts.map((p) => ({
  title: p.name,
  link: `/products/${p.slug}`,
  thumbnail: p.image,
}));


const categories = [
  { name: "Smartphones", slug: "smartphones", icon: Smartphone, count: "50+" },
  { name: "Laptops", slug: "laptops", icon: Laptop, count: "40+" },
  { name: "Tablets", slug: "tablets", icon: Tablet, count: "25+" },
  { name: "Smartwatches", slug: "smartwatches", icon: Watch, count: "30+" },
  { name: "Cameras", slug: "cameras", icon: Camera, count: "20+" },
];

const perks = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over $50" },
  { icon: Shield, title: "2-Year Warranty", desc: "Official brand coverage" },
  { icon: Headphones, title: "24/7 Support", desc: "Expert tech assistance" },
  { icon: Zap, title: "Fast Delivery", desc: "Same-day dispatch available" },
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* ── Hero Section ─── */}
      <HeroParallax products={parallaxProducts} />

      {/* ── Perks Bar ─── */}
      <section className="border-y border-border bg-card/50 relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {perks.map((perk, index) => (
              <ScrollReveal
                key={perk.title}
                variant="fade-up"
                delay={index * 0.1}
                className="flex items-center gap-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <perk.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{perk.title}</p>
                  <p className="text-xs text-muted-foreground">{perk.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ─── */}
      <section className="py-12 sm:py-20 px-4" id="categories">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal variant="fade-up" className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)]">
              Shop by Category
            </h2>
            <p className="mt-3 text-muted-foreground">
              Find exactly what you&apos;re looking for
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {categories.map((cat, index) => (
              <ScrollReveal
                key={cat.slug}
                variant="scale-up"
                delay={index * 0.05}
                viewportAmount={0.3}
              >
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-2 sm:gap-3 rounded-2xl border border-border bg-card p-4 sm:p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                  id={`category-${cat.slug}`}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <cat.icon className="h-7 w-7" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.count} products</p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─── */}
      <section className="py-12 sm:py-20 px-4 bg-card/30" id="featured-products">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal
            variant="fade-up"
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)]">
                Featured Products
              </h2>
              <p className="mt-3 text-muted-foreground">
                Handpicked tech essentials you&apos;ll love
              </p>
            </div>
            <Button variant="outline" asChild className="hidden sm:inline-flex">
              <Link href="/products">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </ScrollReveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {featuredProducts.map((product, index) => (
              <ScrollReveal
                key={product.id}
                variant="fade-up"
                delay={index * 0.05}
                viewportAmount={0.2}
              >
                <ProductCard {...product} />
              </ScrollReveal>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/products">
                View All Products <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─── */}
      <section className="py-12 sm:py-20 px-4" id="cta-banner">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal
            variant="scale-up"
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 border border-primary/20 p-6 sm:p-8 md:p-12 text-center"
          >
            {/* Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

            <h2 className="relative text-2xl sm:text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)]">
              Ready to upgrade your setup?
            </h2>
            <p className="relative mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              Join thousands of tech enthusiasts who already shop with TechVault. Get 10% off
              your first order.
            </p>
            <div className="relative mt-8">
              <Button variant="glow" size="xl" asChild>
                <Link href="/products">
                  Start Shopping <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
