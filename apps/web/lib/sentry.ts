// Sentry error tracking configuration
// Install: npm install @sentry/nextjs

import * as Sentry from "@sentry/nextjs";

/**
 * Initialize Sentry for error tracking in the Next.js frontend.
 * Call this from instrumentation.ts or _app.tsx.
 *
 * Required env vars:
 *   NEXT_PUBLIC_SENTRY_DSN - The Sentry project DSN
 *   SENTRY_AUTH_TOKEN - For source map uploads (build-time only)
 */
export function initSentry() {
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
        console.warn("[Sentry] NEXT_PUBLIC_SENTRY_DSN not set, skipping initialization");
        return;
    }

    Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV,

        // Performance monitoring
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

        // Session replay (captures user interactions for debugging)
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,

        // Filter out noisy errors
        ignoreErrors: [
            "ResizeObserver loop",
            "Non-Error promise rejection",
            "AbortError",
            "NetworkError",
        ],

        // Don't send errors in development by default
        enabled: process.env.NODE_ENV === "production",
    });
}
