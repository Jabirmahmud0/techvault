"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

/**
 * App-level providers: Theme + React Query.
 * Must be a client component since it uses React Context.
 */
export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 2 * 60 * 1000, // 2 minutes
                        refetchOnWindowFocus: false,
                        retry: (failureCount, error) => {
                            // Don't retry auth errors
                            if (error?.message === "Session expired") return false;
                            if (error?.message?.includes("log in")) return false;
                            // Retry up to 3 times for network/server errors
                            return failureCount < 3;
                        },
                        retryDelay: (attemptIndex) => {
                            // Exponential backoff: 1s, 2s, 4s
                            // Gives Render time to spin up from cold start
                            return Math.min(1000 * 2 ** attemptIndex, 8000);
                        },
                    },
                },
            })
    );

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    return (
        <QueryClientProvider client={queryClient}>
            <NextThemesProvider attribute="data-theme" defaultTheme="dark" enableSystem disableTransitionOnChange>
                {clientId ? (
                    <GoogleOAuthProvider clientId={clientId}>
                        {children}
                    </GoogleOAuthProvider>
                ) : (
                    <>
                        {children}
                        <div className="fixed bottom-4 right-4 z-50 rounded-md bg-destructive p-4 text-destructive-foreground shadow-lg">
                            <p className="font-bold">Configuration Error</p>
                            <p className="text-sm">Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID</p>
                        </div>
                    </>
                )}
                <Toaster />
            </NextThemesProvider>
        </QueryClientProvider>
    );
}
