"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { useAdminStats, useRecentOrders, useRevenueChart, useRevenueByCategory, useLowStockProducts } from "@/lib/hooks/use-admin";
import { format } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
    const { data: stats, isLoading: statsLoading } = useAdminStats();
    const { data: recentOrders, isLoading: ordersLoading } = useRecentOrders();
    const { data: revenueData, isLoading: chartLoading } = useRevenueChart();

    if (statsLoading) {
        return (
            <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-[100px]" />
                                <Skeleton className="h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-[60px]" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Skeleton className="col-span-4 h-[300px]" />
                    <Skeleton className="col-span-3 h-[300px]" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)]">
                Dashboard
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats?.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            {stats?.trends?.revenue !== undefined && (
                                <span className={stats.trends.revenue >= 0 ? "text-green-600" : "text-red-500"}>
                                    {stats.trends.revenue >= 0 ? "↑" : "↓"} {Math.abs(stats.trends.revenue)}%
                                </span>
                            )}
                            vs last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.orders}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            {stats?.trends?.orders !== undefined && (
                                <span className={stats.trends.orders >= 0 ? "text-green-600" : "text-red-500"}>
                                    {stats.trends.orders >= 0 ? "↑" : "↓"} {Math.abs(stats.trends.orders)}%
                                </span>
                            )}
                            vs last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.users}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            {stats?.trends?.users !== undefined && (
                                <span className={stats.trends.users >= 0 ? "text-green-600" : "text-red-500"}>
                                    {stats.trends.users >= 0 ? "↑" : "↓"} {Math.abs(stats.trends.users)}%
                                </span>
                            )}
                            vs last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.products}</div>
                        <p className="text-xs text-muted-foreground">Active products</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Over Time (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            {revenueData && revenueData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(str) => format(new Date(str), "MMM d")}
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `$${value}`}
                                        />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                            formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
                                            labelFormatter={(label) => format(new Date(label), "MMMM d, yyyy")}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#8884d8"
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    No revenue data available
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {recentOrders && recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                        {order.user?.name?.slice(0, 2) || "U"}
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{order.user?.name || "Unknown User"}</p>
                                        <p className="text-xs text-muted-foreground">{order.user?.email || "No email"}</p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        +${Number(order.total).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                            {(!recentOrders || recentOrders.length === 0) && (
                                <div className="text-center text-muted-foreground py-8">
                                    No recent orders
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <RevenueByCategoryChart />
                <LowStockAlerts />
            </div>
        </div>
    );
}

function RevenueByCategoryChart() {
    const { data, isLoading } = useRevenueByCategory();
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center">
                            Loading...
                        </div>
                    ) : data && data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            No category data available
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function LowStockAlerts() {
    const { data: products, isLoading } = useLowStockProducts();

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Low Stock Alerts
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="text-center py-4 text-muted-foreground">Loading...</div>
                    ) : products && products.length > 0 ? (
                        products.map((product) => (
                            <div key={product.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div className="space-y-1">
                                    <p className="font-medium text-sm leading-none">{product.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                                            {product.stock} left
                                        </Badge>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/admin/products/${product.id}/edit`}>
                                        Manage <ArrowRight className="ml-1 h-3 w-3" />
                                    </Link>
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center text-muted-foreground py-8">
                            <p>No low stock alerts</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
