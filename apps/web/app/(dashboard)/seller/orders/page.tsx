"use client";

import { SellerOrdersTable } from "@/components/seller/seller-orders-table";

export default function SellerOrdersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                    <p className="text-muted-foreground mt-2">
                        View orders containing your products
                    </p>
                </div>
            </div>

            <SellerOrdersTable />
        </div>
    );
}
