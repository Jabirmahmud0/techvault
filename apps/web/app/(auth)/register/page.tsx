"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
import { useAuthStore } from "@/lib/stores/auth-store";
import { GoogleLoginBtn } from "@/components/auth/google-login-btn";
import { cn } from "@/lib/utils";

const passwordRequirements = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
    { label: "One number", test: (p: string) => /[0-9]/.test(p) },
    { label: "One special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

/**
 * Registration page with matching glassmorphism design and Zod-validated form.
 */
export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);

    const form = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    const watchPassword = form.watch("password");

    const onSubmit = async (values: RegisterInput) => {
        setLoading(true);
        setError("");

        try {
            const res = await api.post<{ success: true; data: { message: string, user: any } }>("/auth/register", values);
            // Registration successful, redirect to verification
            toast.success("Account created! Please check your email for the code.");
            router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
        } catch (err: any) {
            setError(err.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-accent/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md"
            >
                <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-8 shadow-2xl">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <Zap className="h-8 w-8 text-primary fill-primary" />
                        <span className="text-2xl font-bold font-[family-name:var(--font-heading)] gradient-text">
                            TechVault
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold text-center mb-2 font-[family-name:var(--font-heading)]">
                        Create Account
                    </h1>
                    <p className="text-center text-muted-foreground text-sm mb-8">
                        Join TechVault and start shopping premium tech
                    </p>

                    {error && (
                        <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                            {error}
                        </div>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* Name */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="text"
                                                    placeholder="John Doe"
                                                    className="pl-10"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Email */}
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

                            {/* Password */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
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

                                        {/* Password Strength Indicator */}
                                        {watchPassword && watchPassword.length > 0 && (
                                            <div className="space-y-1.5 pt-1">
                                                {passwordRequirements.map((req) => (
                                                    <div key={req.label} className="flex items-center gap-2">
                                                        <Check
                                                            className={cn(
                                                                "h-3.5 w-3.5",
                                                                req.test(watchPassword) ? "text-green-500" : "text-muted-foreground/30"
                                                            )}
                                                        />
                                                        <span
                                                            className={cn(
                                                                "text-xs",
                                                                req.test(watchPassword) ? "text-green-500" : "text-muted-foreground"
                                                            )}
                                                        >
                                                            {req.label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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
                                {loading ? "Creating account..." : "Create Account"}
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </form>
                    </Form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border/50" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <GoogleLoginBtn />

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
