"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * GuestGuard: wraps guest-only pages (login, register, etc.)
 *
 * Rules:
 * - If auth check is still pending: show children immediately (don't block — avoids cold-start spinner)
 * - If check is done AND user is authenticated: redirect to callbackUrl
 * - If check is done AND user is NOT authenticated: show children (login form)
 */
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

    // Only show redirect spinner AFTER we've confirmed auth — never before.
    // This eliminates the cold-start blocking spinner on the login page.
    if (userCheckComplete && isAuthenticated) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    // Always render children while check is pending OR user is not authenticated
    return <>{children}</>;
}
