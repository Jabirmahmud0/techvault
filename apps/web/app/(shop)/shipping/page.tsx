import { Metadata } from "next";
import { Truck, Clock, Globe, Package } from "lucide-react";

export const metadata: Metadata = {
    title: "Shipping Information | TechVault",
    description:
        "Learn about TechVault shipping options, delivery times, and policies.",
};

const shippingOptions = [
    {
        icon: Package,
        title: "Standard Shipping",
        time: "5–7 business days",
        cost: "Free on orders over $50 · $9.99 otherwise",
    },
    {
        icon: Truck,
        title: "Express Shipping",
        time: "1–3 business days",
        cost: "$19.99",
    },
    {
        icon: Clock,
        title: "Same-Day Delivery",
        time: "Available in select metros",
        cost: "$29.99",
    },
    {
        icon: Globe,
        title: "International",
        time: "Coming soon",
        cost: "Stay tuned!",
    },
];

export default function ShippingPage() {
    return (
        <div className="min-h-screen py-12 px-4">
            <div className="mx-auto max-w-4xl space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)]">
                        Shipping Information
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        We offer fast, reliable shipping so you can enjoy your new tech as soon as possible.
                    </p>
                </div>

                {/* Shipping options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {shippingOptions.map((opt) => (
                        <div
                            key={opt.title}
                            className="rounded-2xl border border-border bg-card p-6 space-y-3"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                <opt.icon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg">{opt.title}</h3>
                            <p className="text-sm text-muted-foreground">{opt.time}</p>
                            <p className="text-sm font-medium">{opt.cost}</p>
                        </div>
                    ))}
                </div>

                {/* Notes */}
                <div className="rounded-2xl border border-border bg-card p-8 space-y-4">
                    <h2 className="text-xl font-bold font-[family-name:var(--font-heading)]">
                        Shipping Notes
                    </h2>
                    <ul className="list-disc list-inside text-muted-foreground text-sm space-y-2">
                        <li>Orders placed before 2 PM EST ship the same business day.</li>
                        <li>Delivery times are estimated and may vary during peak periods.</li>
                        <li>Tracking information is emailed once your order ships.</li>
                        <li>P.O. Box addresses are only eligible for standard shipping.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
