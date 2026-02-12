"use client";

import { AdminOrdersTable } from "@/components/admin/orders-table";

export default function AdminOrdersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)]">Orders</h2>
                    <p className="text-muted-foreground">
                        Manage customer orders and track shipments.
                    </p>
                </div>
            </div>

            <AdminOrdersTable />
        </div>
    );
}
