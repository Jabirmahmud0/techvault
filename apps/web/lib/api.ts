import { useAuthStore } from "@/lib/stores/auth-store";

// On the client (browser), use same-origin path so requests go through
// the Next.js rewrite proxy defined in next.config.js.
// On the server (SSR), call the backend directly since rewrites don't apply.
const API_BASE_URL =
    typeof window !== "undefined"
        ? (process.env.NEXT_PUBLIC_API_URL || "/api")
        : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api");

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

    // Attach access token from Zustand store (client-side only)
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

    if (response.status === 401) {
        // Token expired — clear auth state
        if (typeof window !== "undefined") {
            useAuthStore.getState().logout();
        }
        throw new Error("Session expired");
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Network error" }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
}

/** Convenience methods */
export const api = {
    get: <T>(endpoint: string, params?: Record<string, any>, options?: RequestInit) => {
        let url = endpoint;
        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    searchParams.append(key, String(value));
                }
            });
            const queryString = searchParams.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }
        return apiClient<T>(url, options);
    },

    post: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
        apiClient<T>(endpoint, {
            ...options,
            method: "POST",
            body: JSON.stringify(body),
        }),

    put: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
        apiClient<T>(endpoint, {
            ...options,
            method: "PUT",
            body: JSON.stringify(body),
        }),

    patch: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
        apiClient<T>(endpoint, {
            ...options,
            method: "PATCH",
            body: JSON.stringify(body),
        }),

    delete: <T>(endpoint: string, options?: RequestInit) =>
        apiClient<T>(endpoint, { ...options, method: "DELETE" }),
};


