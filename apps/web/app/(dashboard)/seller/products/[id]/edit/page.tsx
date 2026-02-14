"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function SellerEditProductPage() {
    const params = useParams();
    const id = params.id as string;
    const { user } = useAuthStore();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["seller-product", id],
        queryFn: async () => {
            const res = await api.get<any>(`/products/by-id/${id}`);
            return res.data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <p className="text-red-500">Failed to load product.</p>
                <Button variant="outline" asChild>
                    <Link href="/seller/products">Go Back</Link>
                </Button>
            </div>
        );
    }

    // Basic frontend ownership check (backend enforces it strictly)
    if (user?.role !== "ADMIN" && data.sellerId !== user?.id) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <p className="text-red-500">You do not have permission to edit this product.</p>
                <Button variant="outline" asChild>
                    <Link href="/seller/products">Go Back</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/seller/products">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h2 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)]">
                    Edit Product
                </h2>
            </div>
            <div className="rounded-xl border bg-card p-6">
                <ProductForm product={data} productId={id} redirectUrl="/seller/products" />
            </div>
        </div>
    );
}
