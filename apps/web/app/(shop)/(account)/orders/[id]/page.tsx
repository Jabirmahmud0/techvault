"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowLeft, Package, MapPin, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrder } from "@/lib/hooks/use-orders";
import { cn } from "@/lib/utils";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { data: order, isLoading } = useOrder(resolvedParams.id);

    if (isLoading) {
        return (
            <div className="min-h-screen py-8 px-4">
                <div className="mx-auto max-w-4xl space-y-8">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-64" />
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        <Skeleton className="h-32 rounded-xl col-span-2" />
                        <Skeleton className="h-32 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
                    <p className="text-muted-foreground mb-6">The order you are looking for does not exist.</p>
                    <Button variant="outline" asChild>
                        <Link href="/orders">Back to Orders</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="mx-auto max-w-5xl">
                <Link
                    href="/orders"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Orders
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
                            Order #{order.id.slice(0, 8)}
                        </h1>
                        <p className="text-muted-foreground flex items-center gap-2 mt-2">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                    </div>
                    <div className={cn(
                        "px-4 py-2 rounded-full text-sm font-semibold border w-fit",
                        order.status === "PAID" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                            order.status === "PENDING" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                "bg-muted border-border"
                    )}>
                        {order.status}
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Items */}
                        <div className="rounded-2xl border border-border bg-card overflow-hidden">
                            <div className="p-6 border-b border-border">
                                <h2 className="font-semibold flex items-center gap-2">
                                    <Package className="h-5 w-5 text-primary" /> Items
                                </h2>
                            </div>
                            <div className="divide-y divide-border">
                                {order.items.map((item) => (
                                    <div key={item.id} className="p-6 flex gap-4">
                                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted border border-border">
                                            {item.productImage && (
                                                <Image
                                                    src={item.productImage}
                                                    alt={item.productName}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium line-clamp-1">{item.productName}</h3>
                                            <p className="text-muted-foreground text-sm">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">
                                                ${parseFloat(item.price).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Summary */}
                        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                            <h2 className="font-semibold flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" /> Summary
                            </h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${parseFloat(order.total).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span>$0.00</span>
                                </div>
                                <div className="pt-2 mt-2 border-t border-border flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-primary">${parseFloat(order.total).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping (Mock) */}
                        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                            <h2 className="font-semibold flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" /> Shipping Info
                            </h2>
                            <div className="text-sm text-muted-foreground">
                                <p className="text-foreground font-medium">John Doe</p>
                                <p>123 Tech Lane</p>
                                <p>Silicon Valley, CA 94025</p>
                                <p>United States</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
