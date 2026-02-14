"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Animated dark/light mode toggle.
 * Uses Framer Motion layoutId for a smooth pill-slide between icons.
 */
export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="h-9 w-9">
                <Sun className="h-4 w-4" />
            </Button>
        );
    }

    const isDark = theme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="relative flex h-9 w-16 items-center rounded-full border border-border bg-muted/50 p-1 transition-colors hover:bg-muted"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            id="theme-toggle"
        >
            {/* Sliding pill indicator */}
            <motion.div
                className="absolute h-7 w-7 rounded-full bg-primary/20 backdrop-blur-sm"
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                style={{
                    left: isDark ? "calc(100% - 32px)" : "4px",
                }}
            />

            {/* Sun icon */}
            <motion.div
                className="relative z-10 flex h-7 w-7 items-center justify-center"
                animate={{
                    scale: isDark ? 0.85 : 1,
                    opacity: isDark ? 0.4 : 1,
                }}
                transition={{ duration: 0.2 }}
            >
                <Sun className="h-4 w-4 text-amber-500" />
            </motion.div>

            {/* Moon icon */}
            <motion.div
                className="relative z-10 flex h-7 w-7 items-center justify-center"
                animate={{
                    scale: isDark ? 1 : 0.85,
                    opacity: isDark ? 1 : 0.4,
                }}
                transition={{ duration: 0.2 }}
            >
                <Moon className="h-4 w-4 text-blue-400" />
            </motion.div>
        </button>
    );
}
