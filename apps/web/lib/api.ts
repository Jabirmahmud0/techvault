import { useAuthStore } from "@/lib/stores/auth-store";

// On the client (browser), use same-origin path so requests go through
// the Next.js rewrite proxy defined in next.config.js.
// On the server (SSR), call the backend directly since rewrites don't apply.
const API_BASE_URL =
    typeof window !== "undefined"
        ? (process.env.NEXT_PUBLIC_API_URL || "/api")
        : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api");

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string | null) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

/**
 * Attempt to refresh the access token with retry logic.
 * Handles Render free-tier cold starts (~30s wake time).
 */
async function attemptRefresh(retries = 1, delay = 3000): Promise<Response> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            signal: controller.signal,
        });
        clearTimeout(timeout);
        return res;
    } catch (err) {
        if (retries > 0) {
            await new Promise((r) => setTimeout(r, delay));
            return attemptRefresh(retries - 1, delay * 2);
        }
        throw err;
    }
}

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

    if (response.status === 401 && !endpoint.startsWith("/auth/")) {
        if (isRefreshing) {
            return new Promise<string | null>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => {
                return apiClient<T>(endpoint, options);
            });
        }

        isRefreshing = true;

        try {
            const refreshResponse = await attemptRefresh();

            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                const newAccessToken = data.data?.accessToken;

                if (newAccessToken && typeof window !== "undefined") {
                    useAuthStore.setState({ accessToken: newAccessToken });
                }

                processQueue(null, newAccessToken);
                return apiClient<T>(endpoint, options);
            } else if (refreshResponse.status === 401 || refreshResponse.status === 403) {
                // Server explicitly rejected — session truly invalid
                throw new Error("Session expired");
            } else {
                // Server error (500, 502, etc.) — don't logout, just fail this request
                throw new Error(`Server error (${refreshResponse.status})`);
            }
        } catch (error) {
            processQueue(error as Error, null);

            // Only logout if the error indicates the session is truly invalid,
            // not on transient network/server errors
            if (typeof window !== "undefined" && (error as Error).message === "Session expired") {
                useAuthStore.getState().logout();
            }

            throw new Error("Please log in to continue");
        } finally {
            isRefreshing = false;
        }
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Network error" }));
        throw new Error(error.error || error.message || `HTTP ${response.status}`);
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
