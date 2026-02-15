import { Metadata } from "next";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
    title: "Privacy Policy | TechVault",
    description: "TechVault privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen py-12 px-4">
            <div className="mx-auto max-w-3xl space-y-10">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)]">
                        Privacy Policy
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Last updated: February 2026
                    </p>
                </div>

                <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
                        <p>
                            We collect information you provide when creating an account, placing orders,
                            or contacting support — including your name, email, shipping address, and payment details.
                            Payment information is processed securely by Stripe and never stored on our servers.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
                        <p>We use your information to:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Process and fulfill your orders</li>
                            <li>Send order confirmations and shipping updates</li>
                            <li>Provide customer support</li>
                            <li>Improve our products and services</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">3. Data Protection</h2>
                        <p>
                            We implement industry-standard security measures including SSL encryption,
                            secure authentication, and regular security audits to protect your personal data.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">4. Cookies</h2>
                        <p>
                            We use essential cookies for authentication and session management.
                            No third-party tracking cookies are used without your consent.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">5. Your Rights</h2>
                        <p>
                            You can access, update, or delete your personal information at any time
                            through your account settings. To request full data deletion, contact
                            support@techvault.com.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">6. Contact</h2>
                        <p>
                            Questions about this policy? Email us at{" "}
                            <a href="mailto:support@techvault.com" className="text-primary hover:underline">
                                support@techvault.com
                            </a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
