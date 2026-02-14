"use client";

import { ProfileForm } from "@/components/auth/profile-form";

export default function SellerSettingsPage() {
    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your public profile and account security.
                </p>
            </div>

            <ProfileForm
                title="Public Profile"
                description="This information will be displayed on your store page."
            />
        </div>
    );
}
