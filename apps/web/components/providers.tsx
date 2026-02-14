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
                        staleTime: 60 * 1000, // 1 minute
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
            <QueryClientProvider client={queryClient}>
                <NextThemesProvider attribute="data-theme" defaultTheme="dark" enableSystem disableTransitionOnChange>
                    {children}
                    <Toaster />
                </NextThemesProvider>
            </QueryClientProvider>
        </GoogleOAuthProvider>
    );
}
