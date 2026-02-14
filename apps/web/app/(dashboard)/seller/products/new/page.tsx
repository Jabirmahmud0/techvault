"use client";

import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SellerNewProductPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/seller/products">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h2 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)]">
                    Add New Product
                </h2>
            </div>
            <div className="rounded-xl border bg-card p-6">
                <ProductForm redirectUrl="/seller/products" />
            </div>
        </div>
    );
}
