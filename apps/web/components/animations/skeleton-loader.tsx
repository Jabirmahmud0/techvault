"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

/**
 * Enhanced Skeleton Loader with Framer Motion shimmer effect.
 * Replaces the static shadcn Skeleton for a more premium feel.
 */
export function AnimatedSkeleton({ className, ...props }: AnimatedSkeletonProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-md bg-muted/50",
                className
            )}
            {...props}
        >
            <motion.div
                className="absolute inset-0 -translate-x-full"
                animate={{ translateX: ["-100%", "100%"] }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear",
                }}
                style={{
                    background:
                        "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
                }}
            />
            {/* Dark mode shimmer adjustments */}
            <motion.div
                className="absolute inset-0 -translate-x-full dark:block hidden"
                animate={{ translateX: ["-100%", "100%"] }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear",
                }}
                style={{
                    background:
                        "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
                }}
            />
        </div>
    );
}

/**
 * Grid of product card skeletons for loading states
 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                    <AnimatedSkeleton className="h-[300px] w-full rounded-2xl" />
                    <div className="space-y-2">
                        <AnimatedSkeleton className="h-4 w-2/3" />
                        <AnimatedSkeleton className="h-4 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}
