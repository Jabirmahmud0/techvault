"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./button";
import { ArrowRight, Sparkles } from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────── */
interface Product {
    title: string;
    link: string;
    thumbnail: string;
}

/* ── Animated counter for stats ────────────────────────────────── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (v) => `${Math.round(v)}${suffix}`);
    const [display, setDisplay] = useState(`0${suffix}`);

    useEffect(() => {
        const controls = animate(count, target, { duration: 2, ease: "easeOut" });
        const unsub = rounded.on("change", (v) => setDisplay(v));
        return () => { controls.stop(); unsub(); };
    }, [count, target, rounded]);

    return <span>{display}</span>;
}

/* ── Floating product card ─────────────────────────────────────── */
function FloatingCard({
    product,
    index,
    total,
}: {
    product: Product;
    index: number;
    total: number;
}) {
    // stagger entrance delay
    const delay = 0.8 + index * 0.15;

    // Assign each card a unique floating animation
    const floatDuration = 4 + (index % 3) * 1.2;
    const floatY = 8 + (index % 2) * 6;

    // Position cards in a visually pleasing arc on the right side
    const positions = [
        { top: "8%", right: "2%", rotate: 6, scale: 0.9 },
        { top: "2%", right: "22%", rotate: -4, scale: 0.85 },
        { top: "28%", right: "0%", rotate: -8, scale: 0.95 },
        { top: "22%", right: "20%", rotate: 5, scale: 0.8 },
        { top: "50%", right: "6%", rotate: -3, scale: 0.88 },
        { top: "48%", right: "26%", rotate: 7, scale: 0.82 },
    ];

    const pos = positions[index % positions.length]!;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 60 }}
            animate={{
                opacity: 1,
                scale: pos.scale,
                y: [0, -floatY, 0],
            }}
            transition={{
                opacity: { delay, duration: 0.6 },
                scale: { delay, duration: 0.6, type: "spring", stiffness: 200 },
                y: {
                    delay: delay + 0.6,
                    duration: floatDuration,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                },
            }}
            whileHover={{ scale: (pos.scale || 1) + 0.08, rotate: 0, zIndex: 50 }}
            className="absolute hidden md:block w-48 xl:w-56 aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-border/30 cursor-pointer group"
            style={{
                top: pos.top,
                right: pos.right,
                rotate: `${pos.rotate}deg`,
            }}
        >
            <Link href={product.link} className="block h-full w-full relative" tabIndex={-1}>
                <Image
                    src={product.thumbnail}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="224px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute bottom-3 left-3 right-3 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate">
                    {product.title}
                </span>
            </Link>
        </motion.div>
    );
}

/* ── Sparkle particle (deterministic to avoid hydration mismatch) ── */
const SPARKLE_DATA = [
    { size: 3, left: 15, top: 25, dur: 2.8, pause: 2.1 },
    { size: 2, left: 82, top: 18, dur: 3.2, pause: 1.5 },
    { size: 4, left: 45, top: 72, dur: 2.4, pause: 3.0 },
    { size: 2.5, left: 68, top: 40, dur: 3.6, pause: 1.8 },
    { size: 3.5, left: 25, top: 85, dur: 2.6, pause: 2.4 },
    { size: 2, left: 55, top: 12, dur: 3.0, pause: 1.2 },
    { size: 4, left: 38, top: 55, dur: 2.2, pause: 3.5 },
    { size: 3, left: 75, top: 65, dur: 3.4, pause: 2.0 },
    { size: 2.5, left: 20, top: 48, dur: 2.9, pause: 1.6 },
    { size: 3.5, left: 60, top: 30, dur: 3.1, pause: 2.8 },
    { size: 2, left: 88, top: 78, dur: 2.5, pause: 1.4 },
    { size: 4, left: 12, top: 62, dur: 3.3, pause: 2.2 },
    { size: 3, left: 50, top: 20, dur: 2.7, pause: 3.2 },
    { size: 2.5, left: 72, top: 88, dur: 3.5, pause: 1.9 },
    { size: 3.5, left: 30, top: 35, dur: 2.3, pause: 2.6 },
    { size: 2, left: 65, top: 52, dur: 3.0, pause: 1.3 },
    { size: 4, left: 42, top: 15, dur: 2.8, pause: 3.4 },
    { size: 3, left: 78, top: 45, dur: 3.2, pause: 2.0 },
    { size: 2.5, left: 18, top: 70, dur: 2.6, pause: 1.7 },
    { size: 3.5, left: 52, top: 82, dur: 3.4, pause: 2.5 },
];

function SparkleParticle({ index, delay }: { index: number; delay: number }) {
    const d = SPARKLE_DATA[index % SPARKLE_DATA.length]!;
    return (
        <motion.div
            className="absolute rounded-full bg-primary/60"
            style={{
                width: d.size,
                height: d.size,
                left: `${d.left}%`,
                top: `${d.top}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
            }}
            transition={{
                delay,
                duration: d.dur,
                repeat: Infinity,
                repeatDelay: d.pause,
            }}
        />
    );
}

/* ── Word-by-word text reveal ──────────────────────────────────── */
function AnimatedHeadline({ text, className }: { text: string; className?: string }) {
    const words = text.split(" ");
    return (
        <span className={className}>
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{
                        delay: 0.15 + i * 0.08,
                        duration: 0.5,
                        ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="inline-block mr-[0.3em]"
                >
                    {word}
                </motion.span>
            ))}
        </span>
    );
}

/* ── Main Hero Component ───────────────────────────────────────── */
export const HeroParallax = ({ products }: { products: Product[] }) => {
    const displayProducts = products.slice(0, 6);

    return (
        <section className="relative min-h-[70vh] lg:min-h-[92vh] flex items-center overflow-hidden">
            {/* ── Background layers ── */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Primary gradient orb */}
                <motion.div
                    className="absolute w-[600px] h-[600px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
                        top: "10%",
                        left: "5%",
                    }}
                    animate={{
                        x: [0, 40, 0],
                        y: [0, -30, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Secondary orb */}
                <motion.div
                    className="absolute w-[400px] h-[400px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)",
                        bottom: "10%",
                        right: "15%",
                    }}
                    animate={{
                        x: [0, -30, 0],
                        y: [0, 20, 0],
                        scale: [1, 1.15, 1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Accent orb */}
                <motion.div
                    className="absolute w-[300px] h-[300px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)",
                        top: "50%",
                        left: "40%",
                    }}
                    animate={{
                        x: [0, 25, -15, 0],
                        y: [0, -20, 10, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Sparkle particles */}
                {Array.from({ length: 20 }).map((_, i) => (
                    <SparkleParticle key={i} index={i} delay={i * 0.3} />
                ))}

                {/* Grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>

            {/* ── Content ── */}
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full py-20">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left side — Text */}
                    <div className="max-w-2xl text-center lg:text-left">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-6 lg:mb-8"
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            Premium Electronics Store
                        </motion.div>

                        {/* Headline */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-[family-name:var(--font-heading)] leading-[1.05] tracking-tight">
                            <AnimatedHeadline text="The Future of" />
                            <br />
                            <AnimatedHeadline
                                text="Tech is Here"
                                className="gradient-text"
                            />
                        </h1>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                            className="mt-4 lg:mt-6 text-base sm:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed"
                        >
                            Discover premium electronics with free shipping and official warranty.
                            From cutting-edge smartphones to powerful laptops — your tech upgrade starts here.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            className="mt-6 lg:mt-8 flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4"
                        >
                            <Button variant="glow" size="xl" asChild>
                                <Link href="/products">
                                    Shop Now <ArrowRight className="h-5 w-5 ml-1" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="xl" asChild>
                                <Link href="/categories">Browse Categories</Link>
                            </Button>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                            className="mt-8 lg:mt-12 flex justify-center lg:justify-start gap-6 sm:gap-8 lg:gap-12"
                        >
                            {[
                                { value: 500, suffix: "+", label: "Products" },
                                { value: 10, suffix: "K+", label: "Customers" },
                                { value: 4.9, suffix: "★", label: "Rating" },
                            ].map((stat) => (
                                <div key={stat.label} className="text-center sm:text-left">
                                    <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)]">
                                        <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                                    </div>
                                    <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right side — Floating product cards */}
                    <div className="relative h-[500px] lg:h-[600px] hidden lg:block">
                        {displayProducts.map((product, i) => (
                            <FloatingCard
                                key={`${product.title}-${i}`}
                                product={product}
                                index={i}
                                total={displayProducts.length}
                            />
                        ))}

                        {/* Central glow behind products */}
                        <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full hidden lg:block"
                            style={{
                                background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)",
                            }}
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* ── Bottom fade ── */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </section>
    );
};

/* Re-export for backwards compatibility */
export const Header = () => null;
