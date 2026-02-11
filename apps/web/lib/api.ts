import { useAuthStore } from "./stores/auth-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/**
 * Typed fetch wrapper for API calls.
 * Automatically handles JSON serialization and error responses.
 */
export async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        credentials: "include",
        ...options,
    };

    // Attach access token if available
    if (typeof window !== "undefined") {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            };
        }
    }

    const response = await fetch(url, config);

    // Handle 401 Unauthorized (Token expired)
    if (response.status === 401) {
        try {
            // Try to refresh token
            const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: "POST",
                credentials: "include", // send httpOnly cookie
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                const newAccessToken = data.data.accessToken;

                // Update store
                useAuthStore.getState().setAuth(
                    // @ts-expect-error - user might be null but we just want to update token
                    useAuthStore.getState().user,
                    newAccessToken
                );

                // Retry original request with new token
                const newConfig = {
                    ...config,
                    headers: {
                        ...config.headers,
                        Authorization: `Bearer ${newAccessToken}`,
                    },
                };
                const retryRes = await fetch(url, newConfig);
                if (retryRes.ok) return retryRes.json();
            } else {
                // Refresh failed - logout
                useAuthStore.getState().logout();
                window.location.href = "/login";
                throw new Error("Session expired");
            }
        } catch (error) {
            useAuthStore.getState().logout();
            window.location.href = "/login";
            throw error;
        }
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Network error" }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
}

/** Convenience methods */
export const api = {
    get: <T>(endpoint: string) => apiClient<T>(endpoint),

    post: <T>(endpoint: string, body: unknown) =>
        apiClient<T>(endpoint, {
            method: "POST",
            body: JSON.stringify(body),
        }),

    put: <T>(endpoint: string, body: unknown) =>
        apiClient<T>(endpoint, {
            method: "PUT",
            body: JSON.stringify(body),
        }),

    delete: <T>(endpoint: string) =>
        apiClient<T>(endpoint, { method: "DELETE" }),

    logout: async () => {
        try {
            await apiClient("/auth/logout", { method: "POST" });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            useAuthStore.getState().logout();
            window.location.href = "/login";
        }
    },
};
