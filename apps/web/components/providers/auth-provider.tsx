"use client";

/**
 * Legacy auth provider kept for backwards compatibility.
 * Re-exports from the canonical auth-provider in components/auth/.
 * The project uses custom JWT auth — no NextAuth SessionProvider.
 */
export { AuthProvider } from "@/components/auth/auth-provider";
