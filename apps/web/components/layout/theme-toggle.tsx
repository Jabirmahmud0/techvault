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
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative overflow-hidden"
            aria-label="Toggle theme"
            id="theme-toggle"
        >
            <motion.div
                initial={false}
                animate={{ rotate: theme === "dark" ? 0 : 180, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                {theme === "dark" ? (
                    <Moon className="h-5 w-5" />
                ) : (
                    <Sun className="h-5 w-5" />
                )}
            </motion.div>
        </Button>
    );
}
