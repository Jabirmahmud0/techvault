"use client";

import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)] mb-6">
                Add New Product
            </h2>
            <div className="rounded-xl border bg-card p-6">
                <ProductForm />
            </div>
        </div>
    );
}
