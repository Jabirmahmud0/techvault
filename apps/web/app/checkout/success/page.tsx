"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cart-store";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get("session_id");
    const { clearCart } = useCartStore();
    const [cleared, setCleared] = useState(false);

    useEffect(() => {
        if (sessionId && !cleared) {
            clearCart();
            setCleared(true);
        } else if (!sessionId) {
            // Redirect to home if no session ID
            // setTimeout(() => router.push("/"), 3000);
        }
    }, [sessionId, clearCart, cleared, router]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="w-full max-w-md text-center border-2 border-primary/10 shadow-2xl">
                    <CardHeader>
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-foreground">
                            Order Confirmed!
                        </CardTitle>
                        <CardDescription>
                            Thank you for your purchase. Your order has been received.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg bg-muted p-4 text-sm">
                            <p className="font-medium text-foreground">Order ID</p>
                            <p className="font-mono text-muted-foreground break-all">
                                {sessionId || "Creating order..."}
                            </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            We've sent a confirmation email with your order details and tracking information.
                        </p>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button className="w-full" size="lg" asChild>
                            <Link href="/products">
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                Continue Shopping
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full" asChild>
                            <Link href="/">
                                Go to Homepage <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
