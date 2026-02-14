"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations";
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

/**
 * Forgot Password page — user enters their email to receive a reset link.
 */
export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const form = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (values: ForgotPasswordInput) => {
        setLoading(true);
        setError("");

        try {
            await api.post("/auth/forgot-password", values);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

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

                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="rounded-full bg-green-500/10 p-3">
                                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                                Check Your Email
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                If an account with <strong>{form.getValues("email")}</strong> exists, we&apos;ve sent a
                                password reset link. Check your inbox and spam folder.
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-4"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-center mb-2 font-[family-name:var(--font-heading)]">
                                Forgot Password?
                            </h1>
                            <p className="text-center text-muted-foreground text-sm mb-8">
                                Enter your email and we&apos;ll send you a reset link.
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
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            type="email"
                                                            placeholder="you@example.com"
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
                                            "Send Reset Link"
                                        )}
                                    </Button>
                                </form>
                            </Form>

                            <p className="mt-6 text-center text-sm text-muted-foreground">
                                <Link href="/login" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    Back to Login
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
