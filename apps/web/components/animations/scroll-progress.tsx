"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Thin progress bar at the very top of the page that fills
 * as the user scrolls down — a subtle, modern UI touch.
 */
export function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-primary/80 to-accent origin-left z-[100]"
            style={{ scaleX }}
        />
    );
}
