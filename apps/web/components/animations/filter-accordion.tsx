"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterAccordionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

/**
 * Animated filter accordion with Framer Motion layout animation.
 * Smoothly expands/collapses content with rotate icon transition.
 */
export function FilterAccordion({
    title,
    children,
    defaultOpen = true,
}: FilterAccordionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-border pb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between py-2 text-sm font-semibold hover:text-primary transition-colors"
                aria-expanded={isOpen}
            >
                {title}
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="h-4 w-4" />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                            height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                            opacity: { duration: 0.2 },
                        }}
                        className="overflow-hidden"
                    >
                        <div className="pt-2 pb-1">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
