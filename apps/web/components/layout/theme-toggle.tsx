"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Animated dark/light mode toggle with smooth icon transition.
 * Defers rendering until mounted to prevent hydration mismatch.
 */
export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="relative overflow-hidden" aria-label="Toggle theme">
                <span className="h-5 w-5" />
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="relative overflow-hidden"
            aria-label="Toggle theme"
            id="theme-toggle"
        >
            <motion.div
                initial={false}
                animate={{
                    scale: theme === "dark" ? 0 : 1,
                    rotate: theme === "dark" ? 90 : 0,
                    opacity: theme === "dark" ? 0 : 1,
                }}
                transition={{ duration: 0.2 }}
                className="absolute"
            >
                <Sun className="h-5 w-5" />
            </motion.div>
            <motion.div
                initial={false}
                animate={{
                    scale: theme === "dark" ? 1 : 0,
                    rotate: theme === "dark" ? 0 : -90,
                    opacity: theme === "dark" ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="absolute"
            >
                <Moon className="h-5 w-5" />
            </motion.div>
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
