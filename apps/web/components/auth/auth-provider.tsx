"use client";

import { AuthSync } from "./auth-sync";

/**
 * Auth provider that syncs authentication state on mount.
 * Uses custom JWT auth via Zustand store — no NextAuth SessionProvider needed.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AuthSync />
            {children}
        </>
    );
}
