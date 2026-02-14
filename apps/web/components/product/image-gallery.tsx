"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
    images: (string | { url: string })[];
    alt: string;
}

function safeUrl(img: string | { url: string } | undefined | null): string {
    if (!img) return "https://placehold.co/600x600?text=No+Image";
    const url = typeof img === "object" ? img.url : img;
    return url || "https://placehold.co/600x600?text=No+Image";
}

/**
 * Product image gallery with Framer Motion crossfade transitions and drag gestures.
 * Swipe left/right to navigate, click thumbnails, or use keyboard arrows.
 */
export function ImageGallery({ images, alt }: ImageGalleryProps) {
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const paginate = (dir: number) => {
        setDirection(dir);
        setIndex((prev) => {
            const next = prev + dir;
            if (next < 0) return images.length - 1;
            if (next >= images.length) return 0;
            return next;
        });
    };

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 50;
        if (info.offset.x < -threshold) {
            paginate(1);
        } else if (info.offset.x > threshold) {
            paginate(-1);
        }
    };

    const variants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 80 : -80,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (dir: number) => ({
            x: dir < 0 ? 80 : -80,
            opacity: 0,
        }),
    };

    return (
        <div className="space-y-4">
            {/* Main Image with crossfade + drag */}
            <div
                className="relative aspect-square overflow-hidden rounded-2xl bg-muted border border-border cursor-grab active:cursor-grabbing"
                onKeyDown={(e) => {
                    if (e.key === "ArrowLeft") paginate(-1);
                    if (e.key === "ArrowRight") paginate(1);
                }}
                tabIndex={0}
                role="region"
                aria-label="Product image gallery"
            >
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                        key={index}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.7}
                        onDragEnd={handleDragEnd}
                        className="absolute inset-0"
                    >
                        <Image
                            src={safeUrl(images[index])}
                            alt={`${alt} - Image ${index + 1}`}
                            fill
                            priority={index === 0}
                            unoptimized
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover pointer-events-none"
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Image counter badge */}
                {images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
                        {index + 1} / {images.length}
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-3">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setDirection(i > index ? 1 : -1);
                                setIndex(i);
                            }}
                            className={cn(
                                "relative h-20 w-20 overflow-hidden rounded-xl border-2 transition-all",
                                index === i
                                    ? "border-primary ring-2 ring-primary/20"
                                    : "border-border hover:border-muted-foreground"
                            )}
                        >
                            <Image src={safeUrl(img)} alt="" fill unoptimized sizes="80px" className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
