import { Metadata } from "next";
import { RotateCcw, CheckCircle2, XCircle, Clock } from "lucide-react";

export const metadata: Metadata = {
    title: "Returns & Refunds | TechVault",
    description:
        "TechVault return policy — easy 30-day returns and hassle-free refunds.",
};

export default function ReturnsPage() {
    return (
        <div className="min-h-screen py-12 px-4">
            <div className="mx-auto max-w-4xl space-y-12">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                            <RotateCcw className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)]">
                        Returns & Refunds
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Not satisfied? We make returns simple and hassle-free.
                    </p>
                </div>

                {/* Policy cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-3">
                        <Clock className="h-8 w-8 text-primary mx-auto" />
                        <h3 className="font-semibold">30-Day Window</h3>
                        <p className="text-sm text-muted-foreground">
                            Return any product within 30 days of delivery.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-3">
                        <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto" />
                        <h3 className="font-semibold">Eligible Items</h3>
                        <p className="text-sm text-muted-foreground">
                            Unused, unopened, and in original packaging.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-3">
                        <XCircle className="h-8 w-8 text-red-400 mx-auto" />
                        <h3 className="font-semibold">Exceptions</h3>
                        <p className="text-sm text-muted-foreground">
                            Software, opened earbuds, and personalized items.
                        </p>
                    </div>
                </div>

                {/* Steps */}
                <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
                    <h2 className="text-xl font-bold font-[family-name:var(--font-heading)]">
                        How to Return an Item
                    </h2>
                    <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-3">
                        <li>Go to <strong>My Orders</strong> in your account and select the order.</li>
                        <li>Click <strong>Request Return</strong> and select the item(s).</li>
                        <li>Print the prepaid return label we email you.</li>
                        <li>Ship the item back — refunds are processed within 5–7 business days after we receive it.</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
