"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function GuestGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, userCheckComplete } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    useEffect(() => {
        if (userCheckComplete && isAuthenticated) {
            router.replace(callbackUrl);
        }
    }, [isAuthenticated, userCheckComplete, router, callbackUrl]);

    // Don't render children (login form) if we're redirecting
    if (userCheckComplete && isAuthenticated) {
        return null; // or a loading spinner
    }

    return <>{children}</>;
}
