"use client";

import { ProfileForm } from "@/components/auth/profile-form";

export default function AdminProfilePage() {
    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your administrator account details.
                </p>
            </div>

            <ProfileForm />
        </div>
    );
}
