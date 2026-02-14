"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { SellerStatsCards } from "@/components/seller/seller-stats-cards";
import { SellerOrdersTable } from "@/components/seller/seller-orders-table";
import { SellerAnalytics } from "@/components/seller/seller-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SellerDashboardPage() {
    const { user } = useAuthStore();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome back, {user?.name}. Here's an overview of your store.
                </p>
            </div>

            <SellerStatsCards />

            {/* Earnings Analytics */}
            <SellerAnalytics />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-full">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SellerOrdersTable />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
