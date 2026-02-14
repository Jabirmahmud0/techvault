"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";
    const email = searchParams.get("email") || "";

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const form = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            token,
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values: ResetPasswordInput) => {
        setLoading(true);
        setError("");

        try {
            await api.post("/auth/reset-password", {
                email,
                token: values.token,
                newPassword: values.password,
            });
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Invalid or expired reset link. Please request a new one.");
        } finally {
            setLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                    Invalid Reset Link
                </h1>
                <p className="text-muted-foreground text-sm">
                    This password reset link is invalid or has expired.
                </p>
                <Link href="/forgot-password" className="text-primary hover:underline text-sm font-medium">
                    Request a new reset link
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <div className="rounded-full bg-green-500/10 p-3">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                    Password Reset!
                </h1>
                <p className="text-muted-foreground text-sm">
                    Your password has been updated. You can now log in with your new password.
                </p>
                <Link href="/login">
                    <Button variant="glow" size="lg" className="mt-4">
                        Go to Login
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <>
            <h1 className="text-2xl font-bold text-center mb-2 font-[family-name:var(--font-heading)]">
                Set New Password
            </h1>
            <p className="text-center text-muted-foreground text-sm mb-8">
                Enter a new password for <strong>{email}</strong>
            </p>

            {error && (
                <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                    {error}
                </div>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="pl-10 pr-12"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="pl-10"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        variant="glow"
                        size="lg"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            "Reset Password"
                        )}
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </form>
            </Form>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative w-full overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md z-10"
            >
                <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-8 shadow-2xl">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <Zap className="h-8 w-8 text-primary fill-primary" />
                        <span className="text-2xl font-bold font-[family-name:var(--font-heading)] gradient-text">
                            TechVault
                        </span>
                    </div>

                    <Suspense fallback={<div className="text-center text-muted-foreground">Loading...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </motion.div>
        </div>
    );
}
