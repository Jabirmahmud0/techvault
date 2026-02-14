"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, Check, Truck, X } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function SellerOrdersTable() {
    const { user } = useAuthStore();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["seller-orders", page, search, user?.id],
        queryFn: async () => {
            const params: any = {
                page,
                limit: 10,
            };
            if (search) params.search = search;

            const res = await api.get<any>("/orders/seller", params);
            return res;
        },
        enabled: !!user?.id,
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            await api.patch(`/orders/${id}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
            queryClient.invalidateQueries({ queryKey: ["seller-stats"] }); // Refresh stats too
            toast.success("Order status updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update status");
        },
    });

    const orders = data?.data || [];
    const pagination = data?.pagination;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PAID": return "bg-green-500/15 text-green-700 hover:bg-green-500/25";
            case "SHIPPED": return "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25";
            case "DELIVERED": return "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25";
            case "CANCELLED": return "bg-red-500/15 text-red-700 hover:bg-red-500/25";
            default: return "bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25";
        }
    };

    if (isError) {
        return <div className="p-4 text-red-500">Failed to load orders.</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by Order ID..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            <TableHead>Items</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Loading orders...
                                </TableCell>
                            </TableRow>
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order: any) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {order.id.slice(0, 8)}...
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{order.user?.name || "Unknown"}</span>
                                            <span className="text-xs text-muted-foreground">{order.user?.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={getStatusColor(order.status)}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="font-medium mr-2">${Number(order.total).toFixed(2)}</span>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        disabled={order.status === "SHIPPED"}
                                                        onClick={() => updateStatusMutation.mutate({ id: order.id, status: "SHIPPED" })}
                                                    >
                                                        <Truck className="mr-2 h-4 w-4" /> Mark Shipped
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        disabled={order.status === "DELIVERED"}
                                                        onClick={() => updateStatusMutation.mutate({ id: order.id, status: "DELIVERED" })}
                                                    >
                                                        <Check className="mr-2 h-4 w-4" /> Mark Delivered
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-500 focus:text-red-500"
                                                        onClick={() => updateStatusMutation.mutate({ id: order.id, status: "CANCELLED" })}
                                                    >
                                                        <X className="mr-2 h-4 w-4" /> Cancel Order
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {order.items.map((item: any) => (
                                                <div key={item.id} className="text-sm">
                                                    {item.quantity}x {item.product.name}
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isLoading}
                >
                    Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                    Page {page} of {pagination?.totalPages || 1}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination?.hasNext || isLoading}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
