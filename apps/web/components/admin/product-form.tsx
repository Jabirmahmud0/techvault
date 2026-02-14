"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema, CreateProductInput } from "@repo/types";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface ProductFormProps {
    /** If provided, the form operates in edit mode */
    product?: any;
    /** Product ID for edit mode (used in PUT request) */
    productId?: string;
    /** URL to redirect to after success */
    redirectUrl?: string;
}

export function ProductForm({ product, productId, redirectUrl = "/admin/products" }: ProductFormProps = {}) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const isEditMode = !!product;

    // Fetch categories
    const { data: categoriesData } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await api.get<{ success: boolean; data: any[] }>("/categories");
            return res.data;
        },
    });

    const form = useForm<CreateProductInput>({
        resolver: zodResolver(createProductSchema),
        defaultValues: {
            name: product?.name || "",
            slug: product?.slug || "",
            description: product?.description || "",
            shortDescription: product?.shortDescription || "",
            price: product?.price ? Number(product.price) : 0,
            stock: product?.stock ?? 0,
            sku: product?.sku || "",
            brand: product?.brand || "",
            isFeatured: product?.isFeatured ?? false,
            categoryId: product?.categoryId || undefined,
            images: product?.images?.map((img: any) => typeof img === "string" ? img : img.url) || [],
        },
    });

    const { watch, setValue } = form;
    const name = watch("name");

    // Auto-generate slug from name (only in create mode)
    useEffect(() => {
        if (!isEditMode && name) {
            const slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
            setValue("slug", slug, { shouldValidate: true });
        }
    }, [name, setValue, isEditMode]);

    const onSubmit = async (values: CreateProductInput) => {
        try {
            if (isEditMode && productId) {
                await api.put(`/products/${productId}`, values);
                toast.success("Product updated successfully");
            } else {
                await api.post("/products", values);
                toast.success("Product created successfully");
            }
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["product"] });
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            queryClient.invalidateQueries({ queryKey: ["admin-product"] });
            queryClient.invalidateQueries({ queryKey: ["admin"] });
            queryClient.invalidateQueries({ queryKey: ["seller-products"] }); // Invalidate seller query too
            router.push(redirectUrl);
            router.refresh();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || `Failed to ${isEditMode ? "update" : "create"} product`);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">

                {/* Basic Info */}
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="iPhone 15 Pro" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Slug</FormLabel>
                                <FormControl>
                                    <Input placeholder="iphone-15-pro" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Unique URL identifier for the product.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price ($)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Stock Quantity</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Brand</FormLabel>
                                <FormControl>
                                    <Input placeholder="Apple" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categoriesData?.map((category: any) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Detailed product description..."
                                    className="min-h-[150px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Short Description</FormLabel>
                            <FormControl>
                                <Input placeholder="Brief summary..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Settings */}
                <div className="flex items-center gap-8 border rounded-lg p-4">
                    <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg p-3 space-y-0 gap-4">
                                <div className="space-y-0.5">
                                    <FormLabel>Featured Product</FormLabel>
                                    <FormDescription>
                                        Display this product on the home page.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Product Image</FormLabel>
                            <FormControl>
                                <ImageUpload
                                    value={field.value?.[0] || ""}
                                    onChange={(url) => field.onChange(url ? [url] : [])}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Submit */}
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? "Update Product" : "Create Product"}
                </Button>
            </form>
        </Form>
    );
}
