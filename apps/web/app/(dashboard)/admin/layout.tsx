"use client";

import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminSidebar, MobileAdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminGuard>
            <div className="flex min-h-screen">
                <AdminSidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="md:hidden flex items-center h-16 px-4 border-b border-border bg-card/50 backdrop-blur-xl">
                        <MobileAdminSidebar />
                        <span className="ml-4 font-semibold text-lg">TV Admin</span>
                    </header>
                    <main className="flex-1 p-6 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
        </AdminGuard>
    );
}
