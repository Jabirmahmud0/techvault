"use client";

import { ProfileForm } from "@/components/auth/profile-form";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
    const { user, isAuthenticated, hasHydrated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (hasHydrated && !isAuthenticated) {
            router.push("/login?redirect=/profile");
        }
    }, [hasHydrated, isAuthenticated, router]);

    if (!hasHydrated || !isAuthenticated) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="container max-w-4xl py-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2">My Profile</h1>
            <p className="text-muted-foreground mb-8">
                Manage your personal information and account settings
            </p>

            <ProfileForm
                title="Personal Information"
                description="Update your name and profile picture."
            />
        </div>
    );
}
