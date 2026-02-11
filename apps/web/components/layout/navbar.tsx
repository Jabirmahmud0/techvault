"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    ShoppingCart,
    Heart,
    Search,
    User,
    Menu,
    X,
    Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SearchModal } from "@/components/search/search-modal";
import { useCartStore } from "@/lib/stores/cart-store";
import { cn } from "@/lib/utils";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/categories", label: "Categories" },
];

/**
 * Sticky navbar with logo, nav links, search, cart badge, and mobile menu.
 */
export function Navbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { toggleCart, totalItems } = useCartStore();
    const itemCount = totalItems();

    useEffect(() => setMounted(true), []);

    return (
        <>
            <header className="sticky top-0 z-50 w-full glass">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group" id="navbar-logo">
                        <motion.div
                            whileHover={{ rotate: 15, scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Zap className="h-7 w-7 text-primary fill-primary" />
                        </motion.div>
                        <span className="text-xl font-bold font-[family-name:var(--font-heading)] gradient-text">
                            TechVault
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1" id="desktop-nav">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "relative px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                                    pathname === link.href
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {link.label}
                                {pathname === link.href && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute inset-0 rounded-lg bg-primary/10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                    />
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" aria-label="Search" id="nav-search" onClick={() => setSearchOpen(true)}>
                            <Search className="h-5 w-5" />
                        </Button>

                        <Button variant="ghost" size="icon" aria-label="Wishlist" id="nav-wishlist" asChild>
                            <Link href="/wishlist">
                                <Heart className="h-5 w-5" />
                            </Link>
                        </Button>

                        {/* Cart Button with Badge */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleCart}
                            className="relative"
                            aria-label="Cart"
                            id="nav-cart"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {mounted && itemCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                                >
                                    {itemCount > 99 ? "99+" : itemCount}
                                </motion.span>
                            )}
                        </Button>

                        <ThemeToggle />

                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Account"
                            id="nav-account"
                            asChild
                        >
                            <Link href="/login">
                                <User className="h-5 w-5" />
                            </Link>
                        </Button>

                        {/* Mobile Menu Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Menu"
                            id="nav-mobile-menu"
                        >
                            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileOpen && (
                    <motion.nav
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-border md:hidden"
                        id="mobile-nav"
                    >
                        <div className="flex flex-col gap-1 p-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={cn(
                                        "rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                                        pathname === link.href
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-muted"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </motion.nav>
                )}
            </header>

            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}
