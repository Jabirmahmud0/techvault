"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Wraps children with AnimatePresence for smooth page transitions.
 * Fade + slide up on enter, fade out on exit.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
