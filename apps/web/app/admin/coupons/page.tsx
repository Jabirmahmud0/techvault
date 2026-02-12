"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertDialog,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Trash2, Check, X } from "lucide-react";
import { format } from "date-fns";

interface Coupon {
    id: string;
    code: string;
    discountPercent: number;
    maxUses: number | null;
    usesCount: number;
    minOrderAmount: string | null;
    expiresAt: string | null;
    isActive: boolean;
    createdAt: string;
}

function useCoupons() {
    return useQuery({
        queryKey: ["admin", "coupons"],
        queryFn: async () => {
            const res = await api.get<{ data: Coupon[] }>("/coupons");
            return res.data;
        },
    });
}

export default function AdminCouponsPage() {
    const queryClient = useQueryClient();
    const { data: coupons, isLoading } = useCoupons();
    const [showForm, setShowForm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);

    const [formData, setFormData] = useState({
        code: "",
        discountPercent: "",
        maxUses: "",
        minOrderAmount: "",
        expiresAt: "",
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            return api.post("/coupons", {
                code: data.code,
                discountPercent: parseInt(data.discountPercent),
                maxUses: data.maxUses ? parseInt(data.maxUses) : null,
                minOrderAmount: data.minOrderAmount || null,
                expiresAt: data.expiresAt || null,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
            toast.success("Coupon created!");
            setShowForm(false);
            setFormData({ code: "", discountPercent: "", maxUses: "", minOrderAmount: "", expiresAt: "" });
        },
        onError: () => toast.error("Failed to create coupon"),
    });

    const toggleMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
            return api.put(`/coupons/${id}`, { isActive });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
            toast.success("Coupon updated!");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/coupons/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
            toast.success("Coupon deleted!");
            setDeleteTarget(null);
        },
        onError: () => toast.error("Failed to delete coupon"),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)]">
                    Coupons
                </h2>
                <Button onClick={() => setShowForm(!showForm)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Coupon
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create Coupon</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="code">Code</Label>
                                <Input
                                    id="code"
                                    placeholder="SUMMER20"
                                    value={formData.code}
                                    onChange={(e) => setFormData(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="discountPercent">Discount %</Label>
                                <Input
                                    id="discountPercent"
                                    type="number"
                                    min="1"
                                    max="100"
                                    placeholder="20"
                                    value={formData.discountPercent}
                                    onChange={(e) => setFormData(f => ({ ...f, discountPercent: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxUses">Max Uses (optional)</Label>
                                <Input
                                    id="maxUses"
                                    type="number"
                                    placeholder="100"
                                    value={formData.maxUses}
                                    onChange={(e) => setFormData(f => ({ ...f, maxUses: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="minOrderAmount">Min Order Amount (optional)</Label>
                                <Input
                                    id="minOrderAmount"
                                    type="number"
                                    step="0.01"
                                    placeholder="50.00"
                                    value={formData.minOrderAmount}
                                    onChange={(e) => setFormData(f => ({ ...f, minOrderAmount: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expiresAt">Expires At (optional)</Label>
                                <Input
                                    id="expiresAt"
                                    type="date"
                                    value={formData.expiresAt}
                                    onChange={(e) => setFormData(f => ({ ...f, expiresAt: e.target.value }))}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    onClick={() => createMutation.mutate(formData)}
                                    disabled={!formData.code || !formData.discountPercent || createMutation.isPending}
                                    className="w-full"
                                >
                                    {createMutation.isPending ? "Creating..." : "Create Coupon"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Uses</TableHead>
                                    <TableHead>Min Order</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {coupons && coupons.map((coupon) => (
                                    <TableRow key={coupon.id}>
                                        <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{coupon.discountPercent}%</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {coupon.usesCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                                        </TableCell>
                                        <TableCell>
                                            {coupon.minOrderAmount ? `$${Number(coupon.minOrderAmount).toFixed(2)}` : "—"}
                                        </TableCell>
                                        <TableCell>
                                            {coupon.expiresAt
                                                ? format(new Date(coupon.expiresAt), "MMM d, yyyy")
                                                : "Never"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={coupon.isActive ? "default" : "outline"}
                                                className={coupon.isActive ? "bg-green-600" : ""}
                                            >
                                                {coupon.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => toggleMutation.mutate({ id: coupon.id, isActive: !coupon.isActive })}
                                                    title={coupon.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    {coupon.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => setDeleteTarget(coupon)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!coupons || coupons.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No coupons created yet
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to delete coupon <strong>{deleteTarget?.code}</strong>? This action cannot be undone.
                </AlertDialogDescription>
                <AlertDialogFooter>
                    <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
                    >
                        Delete
                    </Button>
                </AlertDialogFooter>
            </AlertDialog>
        </div>
    );
}
