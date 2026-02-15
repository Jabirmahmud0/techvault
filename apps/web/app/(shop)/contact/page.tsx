import { Metadata } from "next";
import { Mail, MapPin, Phone, Clock } from "lucide-react";

export const metadata: Metadata = {
    title: "Contact Us | TechVault",
    description:
        "Get in touch with TechVault — we're here to help with orders, returns, and more.",
};

const contactInfo = [
    {
        icon: Mail,
        title: "Email",
        detail: "support@techvault.com",
        sub: "We respond within 24 hours",
    },
    {
        icon: Phone,
        title: "Phone",
        detail: "+1 (555) 123-4567",
        sub: "Mon–Fri, 9 AM – 6 PM EST",
    },
    {
        icon: MapPin,
        title: "Address",
        detail: "123 Tech Street, Silicon Valley",
        sub: "CA 94000, United States",
    },
    {
        icon: Clock,
        title: "Business Hours",
        detail: "Monday – Friday",
        sub: "9:00 AM – 6:00 PM EST",
    },
];

export default function ContactPage() {
    return (
        <div className="min-h-screen py-12 px-4">
            <div className="mx-auto max-w-4xl space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)]">
                        Contact Us
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Have a question, concern, or feedback? We&apos;d love to hear from you.
                        Reach out through any of the channels below.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {contactInfo.map((info) => (
                        <div
                            key={info.title}
                            className="rounded-2xl border border-border bg-card p-6 flex items-start gap-4"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                <info.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">{info.title}</h3>
                                <p className="text-sm font-medium">{info.detail}</p>
                                <p className="text-xs text-muted-foreground">{info.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
