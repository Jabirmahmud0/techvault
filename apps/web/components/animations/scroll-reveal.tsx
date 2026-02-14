"use client";

import { motion, useInView, Variant, HTMLMotionProps } from "framer-motion";
import { useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    className?: string;
    variant?: "fade-up" | "fade-in" | "slide-left" | "slide-right" | "scale-up";
    delay?: number;
    duration?: number;
    viewportAmount?: number;
    once?: boolean;
}

export function ScrollReveal({
    children,
    className,
    variant = "fade-up",
    delay = 0,
    duration = 0.5,
    viewportAmount = 0.2,
    once = true,
    ...props
}: ScrollRevealProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { amount: viewportAmount, once });

    const variants = {
        hidden: getHiddenVariant(variant),
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            transition: {
                duration,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94], // cubic-bezier for smooth motion
            },
        },
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={variants as any}
            className={cn(className)}
            {...props}
        >
            {children}
        </motion.div>
    );
}

function getHiddenVariant(variant: string) {
    switch (variant) {
        case "fade-up":
            return { opacity: 0, y: 30 };
        case "fade-in":
            return { opacity: 0 };
        case "slide-left":
            return { opacity: 0, x: -30 };
        case "slide-right":
            return { opacity: 0, x: 30 };
        case "scale-up":
            return { opacity: 0, scale: 0.8 };
        default:
            return { opacity: 0, y: 30 };
    }
}
