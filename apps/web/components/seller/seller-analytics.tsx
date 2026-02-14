"use client";

import { motion } from "framer-motion";
import { DollarSign, TrendingUp, ShoppingBag, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Seller earnings analytics component.
 * Shows revenue breakdown, top products, and monthly trend.
 */

interface EarningsStat {
    label: string;
    value: string;
    change: string;
    changeType: "positive" | "negative" | "neutral";
    icon: React.ElementType;
}

const mockEarnings: EarningsStat[] = [
    {
        label: "Total Earnings",
        value: "$12,450.00",
        change: "+12.5%",
        changeType: "positive",
        icon: DollarSign,
    },
    {
        label: "This Month",
        value: "$3,280.00",
        change: "+8.2%",
        changeType: "positive",
        icon: Calendar,
    },
    {
        label: "Avg. Order Value",
        value: "$85.40",
        change: "-2.1%",
        changeType: "negative",
        icon: ShoppingBag,
    },
    {
        label: "Conversion Rate",
        value: "3.2%",
        change: "+0.5%",
        changeType: "positive",
        icon: TrendingUp,
    },
];

const monthlyData = [
    { month: "Sep", revenue: 1800 },
    { month: "Oct", revenue: 2200 },
    { month: "Nov", revenue: 2800 },
    { month: "Dec", revenue: 3500 },
    { month: "Jan", revenue: 2900 },
    { month: "Feb", revenue: 3280 },
];

const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

export function SellerAnalytics() {
    return (
        <div className="space-y-6">
            {/* Earnings Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {mockEarnings.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.label}
                                </CardTitle>
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p
                                    className={`text-xs mt-1 ${stat.changeType === "positive"
                                            ? "text-emerald-500"
                                            : stat.changeType === "negative"
                                                ? "text-red-500"
                                                : "text-muted-foreground"
                                        }`}
                                >
                                    {stat.change} from last month
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Revenue Chart (CSS bar chart) */}
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end justify-between gap-2 h-48">
                        {monthlyData.map((d, i) => (
                            <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                                <motion.div
                                    className="w-full bg-primary/80 rounded-t-md min-h-[4px]"
                                    initial={{ height: 0 }}
                                    animate={{
                                        height: `${(d.revenue / maxRevenue) * 100}%`,
                                    }}
                                    transition={{
                                        delay: 0.3 + i * 0.1,
                                        duration: 0.6,
                                        ease: "easeOut",
                                    }}
                                />
                                <span className="text-xs text-muted-foreground">{d.month}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
