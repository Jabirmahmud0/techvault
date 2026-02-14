"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function SellerGuard({ children }: { children: React.ReactNode }) {
    const { user, hasHydrated } = useAuthStore();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // Wait for hydration/auth check
        if (!hasHydrated) return;

        if (!user) {
            router.replace("/login?redirect=/seller");
            return;
        }

        if (user.role !== "SELLER" && user.role !== "ADMIN") {
            // Admins can also access seller view naturally
            router.replace("/");
            return;
        }

        setIsAuthorized(true);
    }, [user, hasHydrated, router]);

    if (!hasHydrated || !isAuthorized) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
