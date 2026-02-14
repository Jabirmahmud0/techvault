"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { updateProfileSchema, type UpdateProfileInput } from "@repo/types";
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
import { Save, Loader2, User, Key } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
    redirectOnSuccess?: string;
    title?: string;
    description?: string;
}

export function ProfileForm({
    redirectOnSuccess,
    title = "Public Profile",
    description = "Manage your public profile and account security."
}: ProfileFormProps) {
    const { user, updateUser } = useAuthStore();
    const queryClient = useQueryClient();
    const router = useRouter();

    // Fetch latest profile data
    const { data: profile, isLoading } = useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const res = await api.get<{ data: any }>("/users/profile");
            return res.data;
        },
    });

    const form = useForm<UpdateProfileInput>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            name: user?.name || "",
            image: user?.image || "",
            password: "",
        },
    });

    // Update form when profile loads
    useEffect(() => {
        if (profile) {
            form.reset({
                name: profile.name,
                image: profile.image || "",
                password: "", // Always empty
            });
        }
    }, [profile, form]);

    const mutation = useMutation({
        mutationFn: async (values: UpdateProfileInput) => {
            // Remove empty password if not provided
            const updates = { ...values };
            if (!updates.password) delete updates.password;

            const res = await api.patch<{ data: any }>("/users/profile", updates);
            return res.data;
        },
        onSuccess: (updatedUser) => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            // Update auth store with new user info
            if (user) {
                updateUser({
                    name: updatedUser.name,
                    image: updatedUser.image,
                });
            }
            toast.success("Profile updated successfully");
            form.setValue("password", ""); // Clear password field

            if (redirectOnSuccess) {
                router.push(redirectOnSuccess);
            }
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update profile");
        },
    });

    function onSubmit(values: UpdateProfileInput) {
        mutation.mutate(values);
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Public Profile */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {title}
                        </CardTitle>
                        <CardDescription>
                            {description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Profile Picture</FormLabel>
                                    <FormControl>
                                        <div className="max-w-[200px]">
                                            <ImageUpload
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Recommended size: 400x400px.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2">
                                <FormLabel>Email Address</FormLabel>
                                <Input
                                    value={user?.email || ""}
                                    disabled
                                    className="bg-muted text-muted-foreground"
                                />
                                <p className="text-[0.8rem] text-muted-foreground">
                                    Email cannot be changed. Contact support assistance.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            Security
                        </CardTitle>
                        <CardDescription>
                            Update your password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Leave empty to keep current" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Must be at least 8 characters long.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full md:w-auto min-w-[150px]"
                        disabled={mutation.isPending || !form.formState.isDirty}
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>

            </form>
        </Form>
    );
}
