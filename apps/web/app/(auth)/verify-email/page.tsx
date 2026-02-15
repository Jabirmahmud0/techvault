"use client";

import { motion } from "framer-motion";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Zap, ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import Link from "next/link";
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
import { toast } from "sonner"; // Assuming sonner is used

const otpSchema = z.object({
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

type OtpInput = z.infer<typeof otpSchema>;

function VerifyEmailForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email"); // Get email from URL
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const form = useForm<OtpInput>({
        resolver: zodResolver(otpSchema),
        defaultValues: {
            otp: "",
        },
    });

    if (!email) {
        return (
            <div className="text-center">
                <p className="text-destructive mb-4">Email parameter missing.</p>
                <Button asChild variant="outline">
                    <Link href="/login">Go to Login</Link>
                </Button>
            </div>
        );
    }

    const onSubmit = async (values: OtpInput) => {
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
            const res = await fetch(`${apiUrl}/auth/verify-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, otp: values.otp }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Verification failed");
                return;
            }

            toast.success("Email verified successfully!");
            router.push("/login?verified=true");
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
            await fetch(`${apiUrl}/auth/resend-verification`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email }),
            });
            toast.success("New code sent! Check your inbox (or terminal).");
        } catch (error) {
            toast.error("Failed to resend code");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-center gap-2 mb-8">
                <Zap className="h-8 w-8 text-primary fill-primary" />
                <span className="text-2xl font-bold font-[family-name:var(--font-heading)] gradient-text">
                    TechVault
                </span>
            </div>

            <h1 className="text-2xl font-bold text-center mb-2 font-[family-name:var(--font-heading)]">
                Verify Your Email
            </h1>
            <p className="text-center text-muted-foreground text-sm mb-8">
                We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
            </p>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="otp"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Verification Code</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            {...field}
                                            placeholder="123456"
                                            className="pl-10 tracking-widest text-lg font-mono placeholder:tracking-normal"
                                            maxLength={6}
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
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Verify Account"}
                    </Button>
                </form>
            </Form>

            <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                    Didn&apos;t receive the code?{" "}
                    <button
                        onClick={handleResend}
                        disabled={resending}
                        className="text-primary font-medium hover:underline disabled:opacity-50"
                    >
                        {resending ? "Sending..." : "Resend Code"}
                    </button>
                </p>
                <div className="mt-4">
                    <Link
                        href="/register"
                        className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-3 w-3" />
                        Back to Register
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative w-full overflow-hidden">
            {/* Background gradient (same as login/register) */}
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
                    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>}>
                        <VerifyEmailForm />
                    </Suspense>
                </div>
            </motion.div>
        </div>
    );
}
