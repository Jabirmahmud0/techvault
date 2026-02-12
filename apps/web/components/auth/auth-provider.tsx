"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // We use an environment variable for the client ID
    // If not set, the Google Login feature will just fail gracefully or log an error
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

    return (
        <GoogleOAuthProvider clientId={clientId}>
            {children}
        </GoogleOAuthProvider>
    );
}
