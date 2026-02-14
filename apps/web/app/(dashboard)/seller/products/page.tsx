"use client";

import { SellerProductsTable } from "@/components/seller/seller-products-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function SellerProductsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your product catalog
                    </p>
                </div>
                <Button asChild>
                    <Link href="/seller/products/new">
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Link>
                </Button>
            </div>

            <SellerProductsTable />
        </div>
    );
}
