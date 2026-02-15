"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { api } from "@/lib/api";

/**
 * Auth sync component that restores session from the backend on mount.
 * Calls /auth/me to verify the current access token and hydrate Zustand store.
 * Falls back to /auth/refresh if the access token is missing but refresh cookie exists.
 *
 * Resilient to transient errors (e.g. Render cold starts) — only logs out
 * when the server explicitly rejects the refresh token.
 */
export function AuthSync() {
    const setAuth = useAuthStore((s) => s.setAuth);
    const logout = useAuthStore((s) => s.logout);
    const setHasHydrated = useAuthStore((s) => s.setHasHydrated);
    const setUserCheckComplete = useAuthStore((s) => s.setUserCheckComplete);
    const accessToken = useAuthStore((s) => s.accessToken);
    const user = useAuthStore((s) => s.user);

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

        /**
         * Fetch with a single retry after a delay — handles Render cold starts
         * which can take ~30s to wake up on the free tier.
         */
        async function fetchWithRetry(
            url: string,
            options: RequestInit,
            retries = 1,
            delay = 3000
        ): Promise<Response> {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 15000);
                const res = await fetch(url, { ...options, signal: controller.signal });
                clearTimeout(timeout);
                return res;
            } catch (err) {
                if (retries > 0) {
                    await new Promise((r) => setTimeout(r, delay));
                    return fetchWithRetry(url, options, retries - 1, delay * 2);
                }
                throw err;
            }
        }

        async function syncAuth() {
            try {
                if (accessToken) {
                    // Verify existing token
                    try {
                        const res = await api.get<{ data: any }>("/auth/me");
                        if (res.data) {
                            setAuth(res.data, accessToken);
                            setHasHydrated(true);
                            setUserCheckComplete(true);
                            return;
                        }
                    } catch {
                        // Token might be expired — fall through to refresh
                    }
                }

                // Check if we had a previous session — user data persists in
                // localStorage even after the 15-min access token expires.
                const hadPreviousSession = !!accessToken || !!user;
                if (!hadPreviousSession) {
                    // No previous session at all — nothing to restore
                    // No previous session at all — nothing to restore
                    setHasHydrated(true); // store is loaded
                    setUserCheckComplete(true); // verification done (no user)
                    return;
                }

                // Try refreshing the token via the httpOnly cookie
                const refreshRes = await fetchWithRetry(
                    `${apiUrl}/auth/refresh`,
                    {
                        method: "POST",
                        credentials: "include",
                    }
                );

                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    if (data?.data?.accessToken) {
                        // We got a fresh token — now fetch user profile
                        const meRes = await fetchWithRetry(
                            `${apiUrl}/auth/me`,
                            {
                                headers: {
                                    Authorization: `Bearer ${data.data.accessToken}`,
                                },
                                credentials: "include",
                            }
                        );
                        if (meRes.ok) {
                            const meData = await meRes.json();
                            setAuth(meData.data, data.data.accessToken);
                        }
                    }
                } else if (refreshRes.status === 401 || refreshRes.status === 403) {
                    // Server explicitly rejected the refresh token — session is truly invalid
                    logout();
                }
                // For other error codes (500, 502, 503, etc.) — don't logout.
                // The user's localStorage session stays intact and will retry on next page load.
            } catch {
                // Network error / timeout — likely Render cold start.
                // Do NOT logout — keep existing session, retry on next navigation.
                console.warn("[AuthSync] Network error during session restore — will retry on next load");
            } finally {
                setUserCheckComplete(true);
            }
        }

        syncAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}
