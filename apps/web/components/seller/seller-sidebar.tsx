"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Settings,
    LogOut
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const sidebarItems = [
    {
        title: "Overview",
        href: "/seller",
        icon: LayoutDashboard,
    },
    {
        title: "My Products",
        href: "/seller/products",
        icon: Package,
    },
    {
        title: "Orders",
        href: "/seller/orders",
        icon: ShoppingBag,
    },
    {
        title: "Settings",
        href: "/seller/settings",
        icon: Settings,
    },
];

export function SellerSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuthStore();

    const handleLogout = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
            await fetch(`${apiUrl}/auth/logout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            logout();
            toast.success("Logged out successfully");
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout failed", error);
            logout();
            router.push("/login");
        }
    };

    return (
        <div className="hidden md:flex flex-col w-64 border-r bg-card/50 backdrop-blur-xl h-[calc(100vh-4rem)] sticky top-16">
            <div className="p-6 border-b">
                <h2 className="font-bold text-xl tracking-tight">Seller Hub</h2>
            </div>
            <div className="flex-1 py-6 px-4 space-y-2">
                {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    );
                })}
            </div>
            <div className="p-4 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
