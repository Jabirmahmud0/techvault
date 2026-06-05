"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

/**
 * Auth sync component that restores session from the backend on mount.
 *
 * Strategy:
 * 1. If the Zustand store already has a persisted session (from localStorage),
 *    mark userCheckComplete=true IMMEDIATELY so the UI never blocks.
 * 2. Then verify the session in the background via /api/auth/refresh.
 * 3. Only log out on a definitive 401/403 — never on network errors or timeouts
 *    (which happen during Render free-tier cold starts).
 */
export function AuthSync() {
    const setAuth = useAuthStore((s) => s.setAuth);
    const logout = useAuthStore((s) => s.logout);
    const setUserCheckComplete = useAuthStore((s) => s.setUserCheckComplete);
    const accessToken = useAuthStore((s) => s.accessToken);
    const user = useAuthStore((s) => s.user);

    useEffect(() => {
        async function syncAuth() {
            // No persisted session at all — nothing to check
            if (!user && !accessToken) {
                setUserCheckComplete(true);
                return;
            }

            // We already have a persisted session in localStorage.
            // Mark the check as complete IMMEDIATELY so the UI is never blocked.
            // We'll verify it silently in the background.
            setUserCheckComplete(true);

            // Background verification — silently confirm the session is still valid
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 35000);

                const refreshRes = await fetch("/api/auth/refresh", {
                    method: "POST",
                    credentials: "include",
                    signal: controller.signal,
                });
                clearTimeout(timeout);

                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    if (data?.data?.accessToken) {
                        // Refresh succeeded — fetch fresh user profile
                        const meRes = await fetch("/api/auth/me", {
                            headers: { Authorization: `Bearer ${data.data.accessToken}` },
                            credentials: "include",
                        });
                        if (meRes.ok) {
                            const meData = await meRes.json();
                            setAuth(meData.data, data.data.accessToken);
                        }
                    }
                } else if (refreshRes.status === 401 || refreshRes.status === 403) {
                    // Server explicitly rejected — session truly invalid, log out
                    console.warn("[AuthSync] Session rejected by server — logging out");
                    logout();
                }
                // 500/502/503/504 = backend waking up — keep existing session
            } catch {
                // Network error / timeout (Render cold start) — keep existing session
                console.warn("[AuthSync] Network error during background verification — keeping existing session");
            }
        }

        syncAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}
