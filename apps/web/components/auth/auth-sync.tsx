"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { api } from "@/lib/api";

/**
 * Auth sync component that restores session from the backend on mount.
 * Calls /auth/me to verify the current access token and hydrate Zustand store.
 * Falls back to /auth/refresh if the access token is missing but refresh cookie exists.
 */
export function AuthSync() {
    const setAuth = useAuthStore((s) => s.setAuth);
    const logout = useAuthStore((s) => s.logout);
    const setHasHydrated = useAuthStore((s) => s.setHasHydrated);
    const accessToken = useAuthStore((s) => s.accessToken);
    const user = useAuthStore((s) => s.user);

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

        async function syncAuth() {
            try {
                if (accessToken) {
                    // Verify existing token
                    const res = await api.get<{ data: any }>("/auth/me");
                    if (res.data) {
                        setAuth(res.data, accessToken);
                        setHasHydrated(true);
                        return;
                    }
                }

                // Check if we had a previous session — user data persists in
                // localStorage even after the 15-min access token expires.
                const hadPreviousSession = !!accessToken || !!user;
                if (!hadPreviousSession) {
                    logout();
                    return;
                }

                // Try refreshing the token via the httpOnly cookie
                const refreshRes = await fetch(
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
                        const meRes = await fetch(
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
                } else {
                    // No valid session
                    logout();
                }
            } catch {
                // Network error or invalid token
                logout();
            } finally {
                setHasHydrated(true);
            }
        }

        syncAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}
