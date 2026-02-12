"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, token } = useAuthStore();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // If not logged in or no token, redirect to login
        if (!token || !user) {
            router.push("/login");
            return;
        }

        // If logged in but not admin, redirect to home
        if (user.role !== "ADMIN") {
            router.push("/");
            return;
        }

        // Authorized
        setIsAuthorized(true);
    }, [user, token, router]);

    if (!isAuthorized) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
