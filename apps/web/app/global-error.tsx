"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Error:", error);
    }, [error]);

    return (
        <html>
            <body>
                <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
                    <h2>Application Error</h2>
                    <p>The application crashed deeply. Check console for details.</p>
                    <pre style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "4px", color: "red" }}>
                        {error.message}
                    </pre>
                    <button
                        onClick={() => reset()}
                        style={{
                            padding: "0.5rem 1rem",
                            marginTop: "1rem",
                            background: "#000",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
