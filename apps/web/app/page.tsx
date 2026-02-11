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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* ── Hero Section ─── */}
      <section className="relative min-h-[80vh] flex items-center justify-center px-4" id="hero">
        {/* Gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/15 rounded-full blur-[120px] animate-float" style={{ animationDelay: "3s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Zap className="h-3.5 w-3.5 fill-primary" />
              New arrivals just dropped
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold font-[family-name:var(--font-heading)] leading-tight mt-4"
          >
            The Future of Tech{" "}
            <span className="gradient-text">Starts Here</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Premium electronics handpicked for you. From cutting-edge smartphones to
            powerful laptops — all with free shipping and 2-year warranty.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button variant="glow" size="xl" asChild>
              <Link href="/products">
                Shop Now <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link href="/categories">Browse Categories</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── Perks Bar ─── */}
      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {perks.map((perk) => (
              <div key={perk.title} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <perk.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{perk.title}</p>
                  <p className="text-xs text-muted-foreground">{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ─── */}
      <section className="py-20 px-4" id="categories">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)]">
              Shop by Category
            </h2>
            <p className="mt-3 text-muted-foreground">
              Find exactly what you&apos;re looking for
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
          >
            {categories.map((cat) => (
              <motion.div key={cat.slug} variants={itemVariants}>
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Featured Products ─── */}
      <section className="py-20 px-4 bg-card/30" id="featured-products">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {featuredProducts.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard {...product} />
              </motion.div>
            ))}
          </motion.div>

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
      <section className="py-20 px-4" id="cta-banner">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 border border-primary/20 p-8 sm:p-12 text-center"
          >
            {/* Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

            <h2 className="relative text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)]">
              Ready to upgrade your setup?
            </h2>
            <p className="relative mt-4 text-muted-foreground max-w-lg mx-auto">
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
          </motion.div>
        </div>
      </section>
    </div>
  );
}
