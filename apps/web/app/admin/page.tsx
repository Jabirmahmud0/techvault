"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, ShoppingCart, Users } from "lucide-react";

// Mock data for now - will be replaced with real data fetching
const stats = [
    {
        title: "Total Revenue",
        value: "$45,231.89",
        change: "+20.1% from last month",
        icon: DollarSign,
    },
    {
        title: "Subscriptions",
        value: "+2350",
        change: "+180.1% from last month",
        icon: Users,
    },
    {
        title: "Sales",
        value: "+12,234",
        change: "+19% from last month",
        icon: ShoppingCart,
    },
    {
        title: "Active Now",
        value: "+573",
        change: "+201 since last hour",
        icon: ShoppingBag,
    },
];

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)]">
                Dashboard
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stat.change}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Revenue</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                            Chart Placeholder
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                            Recent Sales List Placeholder
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
