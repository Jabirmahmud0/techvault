import { Metadata } from "next";
import { Building2, ShieldCheck, Truck, HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
    title: "About Us | TechVault",
    description:
        "Learn about TechVault — premium electronics at competitive prices.",
};

const values = [
    {
        icon: ShieldCheck,
        title: "Quality Assurance",
        description:
            "Every product goes through rigorous quality checks before reaching you.",
    },
    {
        icon: Truck,
        title: "Fast Shipping",
        description:
            "Free shipping on orders over $50 with next-day delivery available.",
    },
    {
        icon: HeartHandshake,
        title: "Customer First",
        description:
            "Dedicated support team ready to help you 7 days a week.",
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen py-12 px-4">
            <div className="mx-auto max-w-4xl space-y-16">
                {/* Hero */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                            <Building2 className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)]">
                        About TechVault
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        We&apos;re on a mission to make premium electronics accessible to everyone.
                        Founded with a passion for technology, TechVault curates the best smartphones,
                        laptops, tablets, and accessories at competitive prices.
                    </p>
                </div>

                {/* Values */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {values.map((v) => (
                        <div
                            key={v.title}
                            className="rounded-2xl border border-border bg-card p-6 text-center space-y-3"
                        >
                            <div className="flex justify-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                    <v.icon className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <h3 className="font-semibold text-lg">{v.title}</h3>
                            <p className="text-sm text-muted-foreground">{v.description}</p>
                        </div>
                    ))}
                </div>

                {/* Story */}
                <div className="rounded-2xl border border-border bg-card p-8 space-y-4">
                    <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                        Our Story
                    </h2>
                    <div className="text-muted-foreground space-y-4">
                        <p>
                            TechVault started with a simple idea: technology should be accessible to everyone.
                            We noticed that finding reliable electronics at fair prices was harder than it should be,
                            so we built a platform that puts quality and affordability first.
                        </p>
                        <p>
                            Today, we serve thousands of customers and continue to expand our catalog with the latest
                            and greatest tech products. Our team hand-picks every product, ensuring it meets our
                            strict quality standards before it reaches our shelves.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
