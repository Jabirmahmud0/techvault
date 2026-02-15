"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
    {
        q: "How long does shipping take?",
        a: "Standard shipping takes 5–7 business days. Express shipping (1–3 business days) is available at checkout. Orders over $50 qualify for free standard shipping.",
    },
    {
        q: "What is your return policy?",
        a: "We offer a 30-day return policy on all products. Items must be unused and in their original packaging. Visit our Returns page for full details.",
    },
    {
        q: "Do you ship internationally?",
        a: "Currently, we ship within the United States. International shipping is coming soon — stay tuned!",
    },
    {
        q: "How do I track my order?",
        a: "Once your order ships, you'll receive a tracking link via email. You can also check your order status in your account under Orders.",
    },
    {
        q: "What payment methods do you accept?",
        a: "We accept Visa, Mastercard, American Express, and other major cards via Stripe's secure checkout.",
    },
    {
        q: "Is my payment information secure?",
        a: "Absolutely. All payments are processed through Stripe with 256-bit SSL encryption. We never store your card details.",
    },
    {
        q: "Can I cancel or modify my order?",
        a: "Orders can be cancelled or modified within 1 hour of placement. After that, the order enters processing and cannot be changed. Contact support for assistance.",
    },
    {
        q: "Do you offer warranty on products?",
        a: "All products come with the manufacturer's warranty. Additionally, we offer a 1-year TechVault protection plan on select items.",
    },
];

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-border rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-muted/50 transition-colors"
            >
                <span className="font-medium text-sm">{q}</span>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                        open && "rotate-180"
                    )}
                />
            </button>
            {open && (
                <div className="px-6 pb-4 text-sm text-muted-foreground">
                    {a}
                </div>
            )}
        </div>
    );
}

export default function FaqPage() {
    return (
        <div className="min-h-screen py-12 px-4">
            <div className="mx-auto max-w-3xl space-y-10">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                            <HelpCircle className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)]">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-muted-foreground">
                        Find answers to common questions about shopping at TechVault.
                    </p>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq) => (
                        <FaqItem key={faq.q} {...faq} />
                    ))}
                </div>
            </div>
        </div>
    );
}
