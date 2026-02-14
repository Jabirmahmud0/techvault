"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, Eye, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    AlertDialog,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/auth-store";

export function SellerProductsTable() {
    const { user } = useAuthStore();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["seller-products", page, search, user?.id],
        queryFn: async () => {
            if (!user?.id) return { data: [], pagination: {} };
            const res = await api.get<any>("/products", {
                page,
                limit: 10,
                search,
                sort: "newest",
                sellerId: user.id,
            });
            return res;
        },
        enabled: !!user?.id,
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/products/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["seller-products"] });
            toast.success("Product deleted successfully");
            setDeleteTarget(null);
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete product");
            setDeleteTarget(null);
        },
    });

    const products = data?.data || [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Input
                    placeholder="Search your products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Loading products...
                                </TableCell>
                            </TableRow>
                        ) : isError ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-red-500">
                                    Failed to load products.
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product: any) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{product.name}</span>
                                            <span className="text-xs text-muted-foreground">{product.brand}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{product.category?.name || "N/A"}</TableCell>
                                    <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                                    <TableCell>{product.stock}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.stock > 0 ? "default" : "secondary"}>
                                            {product.stock > 0 ? "Active" : "Out of Stock"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/seller/products/${product.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/products/${product.slug}`} target="_blank">
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-500 focus:text-red-500"
                                                    onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination?.hasPrev}
                >
                    Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                    Page {pagination?.page || 1} of {pagination?.totalPages || 1}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination?.hasNext}
                >
                    Next
                </Button>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete <strong>&ldquo;{deleteTarget?.name}&rdquo;</strong>?
                        This action cannot be undone. All associated images, reviews, and cart items will also be removed.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
                        disabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialog>
        </div>
    );
}
