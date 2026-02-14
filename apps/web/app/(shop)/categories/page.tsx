"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    Smartphone,
    Laptop,
    Tablet,
    Watch,
    Camera,
    Headphones,
    ArrowRight,
} from "lucide-react";

const categories = [
    {
        name: "Smartphones",
        slug: "smartphones",
        icon: Smartphone,
        count: "50+",
        description: "Flagship phones from Apple, Samsung, Google & more",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop",
        color: "from-blue-500/20 to-cyan-500/20",
    },
    {
        name: "Laptops",
        slug: "laptops",
        icon: Laptop,
        count: "40+",
        description: "Powerful machines for work, gaming & creativity",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop",
        color: "from-purple-500/20 to-pink-500/20",
    },
    {
        name: "Tablets",
        slug: "tablets",
        icon: Tablet,
        count: "25+",
        description: "Portable computing for entertainment & productivity",
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop",
        color: "from-orange-500/20 to-amber-500/20",
    },
    {
        name: "Smartwatches",
        slug: "smartwatches",
        icon: Watch,
        count: "30+",
        description: "Stay connected with the latest wearable tech",
        image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=400&fit=crop",
        color: "from-green-500/20 to-emerald-500/20",
    },
    {
        name: "Cameras",
        slug: "cameras",
        icon: Camera,
        count: "20+",
        description: "Professional photography equipment & mirrorless bodies",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop",
        color: "from-red-500/20 to-rose-500/20",
    },
    {
        name: "Headphones",
        slug: "headphones",
        icon: Headphones,
        count: "35+",
        description: "Premium audio from Sony, Bose, Sennheiser & more",
        image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=400&fit=crop",
        color: "from-indigo-500/20 to-violet-500/20",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function CategoriesPage() {
    return (
        <div className="min-h-screen py-12 px-4">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)]">
                        Browse <span className="gradient-text">Categories</span>
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                        Explore our curated collection of premium electronics across all categories
                    </p>
                </motion.div>

                {/* Category Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {categories.map((cat) => (
                        <motion.div key={cat.slug} variants={itemVariants}>
                            <Link
                                href={`/products?category=${cat.slug}`}
                                className="group relative block overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
                                id={`category-card-${cat.slug}`}
                            >
                                {/* Background Image with Overlay */}
                                <div className="relative h-48 overflow-hidden">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                        style={{ backgroundImage: `url(${cat.image})` }}
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-transparent`} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                                </div>

                                {/* Content */}
                                <div className="relative -mt-12 px-6 pb-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                            <cat.icon className="h-7 w-7" />
                                        </div>
                                        <div className="pt-2">
                                            <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] group-hover:text-primary transition-colors">
                                                {cat.name}
                                            </h2>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {cat.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                        <span className="text-sm text-muted-foreground">
                                            {cat.count} products
                                        </span>
                                        <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                                            Browse <ArrowRight className="h-4 w-4" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
