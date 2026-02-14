"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    User,
    Package,
    Heart,
    LogOut,
    Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";


const accountLinks = [
    { href: "/profile", label: "Profile", icon: User },
    { href: "/orders", label: "My Orders", icon: Package },
    { href: "/wishlist", label: "Wishlist", icon: Heart },
];

export function AccountSidebar() {
    const pathname = usePathname();
    // const { logout } = useAuthStore(); // Using direct api.logout for consistency with Navbar

    const handleLogout = () => {
        useAuthStore.getState().logout();
    };

    return (
        <aside className="hidden w-64 flex-col border-r border-border bg-card/50 backdrop-blur-xl md:flex h-[calc(100vh-4rem)] sticky top-16">
            <div className="flex h-16 items-center px-6 border-b border-border">
                <span className="text-lg font-bold font-[family-name:var(--font-heading)]">
                    My Account
                </span>
            </div>
            <nav className="flex-1 space-y-1 p-4">
                {accountLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-border">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:bg-red-500/10 hover:text-red-600"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </aside>
    );
}

export function MobileAccountSidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const handleLogout = () => {
        useAuthStore.getState().logout();
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden mb-4">
                    <Menu className="mr-2 h-4 w-4" />
                    Account Menu
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="px-6 py-4 border-b border-border">
                    <SheetTitle>My Account</SheetTitle>
                </SheetHeader>
                <nav className="flex-1 space-y-1 p-4">
                    {accountLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-border mt-auto">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-500 hover:bg-red-500/10 hover:text-red-600"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
