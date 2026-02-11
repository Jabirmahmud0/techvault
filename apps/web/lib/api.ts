const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

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
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            };
        }
    }

    const response = await fetch(url, config);

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
};
