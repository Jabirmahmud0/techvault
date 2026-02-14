"use client";

import { SellerGuard } from "@/components/seller/seller-guard";
import { SellerSidebar } from "@/components/seller/seller-sidebar";

export default function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SellerGuard>
            <div className="flex min-h-screen pt-16">
                <SellerSidebar />
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </SellerGuard>
    );
}
