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
        console.log("[GuestGuard] Check:", { userCheckComplete, isAuthenticated, callbackUrl });
        if (userCheckComplete && isAuthenticated) {
            console.log("[GuestGuard] Redirecting to:", callbackUrl);
            // Add a small delay to allow the page to render before redirecting
            const timer = setTimeout(() => {
                router.replace(callbackUrl);
            }, 100);
            
            // Cleanup timer
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, userCheckComplete, router, callbackUrl]);

    // Show loading spinner while redirecting
    if (userCheckComplete && isAuthenticated) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    // Show loading state while checking auth status
    if (!userCheckComplete) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    // Show loading state while checking auth status
    if (!userCheckComplete) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return <>{children}</>;
}
