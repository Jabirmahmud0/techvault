"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function CheckoutCancelPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="w-full max-w-md text-center border-2 border-destructive/10 shadow-2xl">
                    <CardHeader>
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                            <XCircle className="h-10 w-10" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-foreground">
                            Payment Cancelled
                        </CardTitle>
                        <CardDescription>
                            Your payment process was cancelled before completion. No charges were made.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            If you encountered an issue or changed your mind, you can try again anytime. Your cart items are still saved.
                        </p>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button className="w-full" size="lg" asChild>
                            <Link href="/checkout">
                                Return to Checkout
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full" asChild>
                            <Link href="/products">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Browse Products
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
