"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AccountSidebar, MobileAccountSidebar } from "@/components/account/account-sidebar";

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, hasHydrated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (hasHydrated && !isAuthenticated) {
            router.push("/login?redirect=/profile");
        }
    }, [hasHydrated, isAuthenticated, router]);

    if (!hasHydrated) {
        return null;
    }

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-background">
            <AccountSidebar />
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                <MobileAccountSidebar />
                <div className="max-w-4xl mx-auto animate-fade-in-up">
                    {children}
                </div>
            </main>
        </div>
    );
}
