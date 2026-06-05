"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function getSafeCallbackUrl(callbackUrl: string | null) {
    if (!callbackUrl || !callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
        return "/";
    }

    return callbackUrl;
}

/**
 * GuestGuard: wraps guest-only pages (login, register, etc.)
 *
 * Rules:
 * - If auth check is still pending: show children immediately (don't block — avoids cold-start spinner)
 * - If check is done AND user is authenticated: redirect to callbackUrl
 * - If check is done AND user is NOT authenticated: show children (login form)
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, userCheckComplete, logout } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));
    const [showGuestPage, setShowGuestPage] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function redirectIfServerSessionExists() {
            if (!userCheckComplete || !isAuthenticated) {
                setShowGuestPage(false);
                return;
            }

            setShowGuestPage(false);

            try {
                const res = await fetch("/api/auth/status", {
                    credentials: "include",
                    cache: "no-store",
                });
                const data = await res.json().catch(() => null);

                if (cancelled) return;

                if (res.ok && data?.authenticated) {
                    router.replace(callbackUrl);
                    return;
                }

                logout();
                setShowGuestPage(true);
            } catch {
                if (!cancelled) {
                    logout();
                    setShowGuestPage(true);
                }
            }
        }

        redirectIfServerSessionExists();

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, userCheckComplete, router, callbackUrl, logout]);

    // Show redirect spinner while validating server cookies for a client-authenticated user.
    // If localStorage is stale but cookies are missing, render the login form.
    if (userCheckComplete && isAuthenticated && !showGuestPage) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    // Always render children while check is pending OR user is not authenticated
    return <>{children}</>;
}
