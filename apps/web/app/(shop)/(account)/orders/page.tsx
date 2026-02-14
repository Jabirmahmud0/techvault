"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/lib/hooks/use-orders";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
    const { data: orders, isLoading } = useOrders();

    if (isLoading) {
        return (
            <div className="min-h-screen py-8 px-4">
                <div className="mx-auto max-w-4xl space-y-6">
                    <Skeleton className="h-10 w-48 mb-8" />
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="rounded-xl border border-border p-6 space-y-4">
                            <div className="flex justify-between">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">No orders yet</h1>
                    <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
                    <Button variant="glow" asChild>
                        <Link href="/products">Browse Products</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="mx-auto max-w-4xl">
                <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-8">
                    My Orders
                </h1>

                <div className="space-y-6">
                    {orders.map((order, index) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary/50"
                        >
                            <div className="p-6">
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold text-lg">
                                                Order #{order.id.slice(0, 8)}
                                            </h3>
                                            <span className={cn(
                                                "px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                order.status === "PAID" ? "bg-green-500/10 text-green-500" :
                                                    order.status === "PENDING" ? "bg-yellow-500/10 text-yellow-500" :
                                                        "bg-muted text-muted-foreground"
                                            )}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Placed on {format(new Date(order.createdAt), "MMMM d, yyyy")}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold">
                                            ${parseFloat(order.total).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {order.items.length} items
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-border">
                                    {order.items.slice(0, 2).map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 text-sm">
                                            <div className="h-2 w-2 rounded-full bg-primary/50" />
                                            <span className="text-muted-foreground">{item.quantity}x</span>
                                            <span className="font-medium line-clamp-1">{item.productName}</span>
                                        </div>
                                    ))}
                                    {order.items.length > 2 && (
                                        <p className="text-xs text-muted-foreground pl-5">
                                            + {order.items.length - 2} more items
                                        </p>
                                    )}
                                </div>
                            </div>

                            <Link
                                href={`/orders/${order.id}`}
                                className="flex items-center justify-center w-full py-3 bg-muted/50 hover:bg-muted text-sm font-medium transition-colors border-t border-border"
                            >
                                View Details <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div >
    );
}
