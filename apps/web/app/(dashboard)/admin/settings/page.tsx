"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { updateSettingsSchema, type UpdateSettingsInput, type Settings } from "@repo/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form";
import { toast } from "sonner";
import { Store, Mail, Globe, CreditCard, Save, Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
    const queryClient = useQueryClient();

    const { data: settings, isLoading, isError } = useQuery<Settings>({
        queryKey: ["admin-settings"],
        queryFn: async () => {
            const res = await api.get<{ data: Settings }>("/settings");
            return res.data;
        },
    });

    const form = useForm<UpdateSettingsInput>({
        resolver: zodResolver(updateSettingsSchema),
        defaultValues: {
            storeName: "",
            storeEmail: "",
            storeUrl: "",
            currency: "USD",
            taxRate: 0,
            shippingFee: 0,
            freeShippingThreshold: 0,
            lowStockThreshold: 10,
        },
    });

    const [showSuccess, setShowSuccess] = useState(false);

    // Reset form when data loads
    useEffect(() => {
        if (settings) {
            form.reset({
                storeName: settings.storeName,
                storeEmail: settings.storeEmail,
                storeUrl: settings.storeUrl || "",
                currency: settings.currency,
                taxRate: Number(settings.taxRate),
                shippingFee: Number(settings.shippingFee),
                freeShippingThreshold: settings.freeShippingThreshold ? Number(settings.freeShippingThreshold) : undefined,
                lowStockThreshold: settings.lowStockThreshold,
            });
        }
    }, [settings, form]);

    const mutation = useMutation({
        mutationFn: async (values: UpdateSettingsInput) => {
            await api.patch("/settings", values);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
            toast.success("Settings saved successfully", {
                description: "Store configuration has been updated."
            });
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000); // Hide after 5 seconds
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to save settings");
        },
    });

    function onSubmit(values: UpdateSettingsInput) {
        mutation.mutate(values);
    }

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-red-500">
                Failed to load settings. Please try again.
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl">
            <h2 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)]">
                Settings
            </h2>

            {showSuccess && (
                <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900 dark:text-green-200 animate-in fade-in slide-in-from-top-2">
                    <Save className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>
                        Settings have been saved successfully.
                    </AlertDescription>
                </Alert>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT COLUMN: Main Store Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Store Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Store className="h-5 w-5" />
                                        Store Information
                                    </CardTitle>
                                    <CardDescription>Basic store details and branding</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="storeName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Store Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="TechVault" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="storeEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Support Email</FormLabel>
                                                    <div className="relative">
                                                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <FormControl>
                                                            <Input className="pl-8" placeholder="support@example.com" {...field} />
                                                        </FormControl>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="storeUrl"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Store URL</FormLabel>
                                                    <div className="relative">
                                                        <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <FormControl>
                                                            <Input className="pl-8" placeholder="https://example.com" {...field} />
                                                        </FormControl>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Payment & Shipping Information
                                    </CardTitle>
                                    <CardDescription>Configure pricing, taxes, and shipping rules</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="currency"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Currency Code</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} maxLength={3} className="uppercase" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="taxRate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tax Rate (%)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" step="0.01" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="shippingFee"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Flat Shipping Fee ($)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" step="0.01" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="freeShippingThreshold"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Free Shipping Over ($)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            {...field}
                                                            value={field.value || ""}
                                                            onChange={e => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>Leave empty to disable</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* RIGHT COLUMN: Sidebar / Secondary Settings */}
                        <div className="space-y-6">
                            {/* Actions Card */}
                            <Card className="border-l-4 border-l-primary/50">
                                <CardHeader>
                                    <CardTitle>Actions</CardTitle>
                                    <CardDescription>Review and save your changes</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {form.formState.isDirty && (
                                        <Alert variant="destructive" className="py-2 text-sm">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertTitle className="text-xs font-semibold">Unsaved Changes</AlertTitle>
                                        </Alert>
                                    )}
                                    <Button type="submit" className="w-full gap-2" disabled={mutation.isPending || !form.formState.isDirty}>
                                        {mutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        Save All Changes
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Inventory */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Inventory</CardTitle>
                                    <CardDescription>Stock alerts</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="lowStockThreshold"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Low Stock Threshold</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                </FormControl>
                                                <FormDescription className="text-xs">
                                                    Alert when stock falls below this quantity.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}
