"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClearAuthPage() {
    const router = useRouter();

    useEffect(() => {
        localStorage.removeItem("auth-storage");
        document.cookie = "accessToken=; Max-Age=0; path=/;";
        setTimeout(() => {
            window.location.href = "/login";
        }, 1000);
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h1 className="text-xl font-bold mb-4">Clearing Authentication State...</h1>
                <p>Removing stale sessions to fix redirect loop.</p>
                <div className="mt-4 animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
        </div>
    );
}
