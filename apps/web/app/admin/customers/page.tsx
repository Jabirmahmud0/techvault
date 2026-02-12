"use client";

import { AdminCustomersTable } from "@/components/admin/customers-table";

export default function AdminCustomersPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)]">
                Customers
            </h2>
            <AdminCustomersTable />
        </div>
    );
}
