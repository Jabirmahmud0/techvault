import { Metadata } from "next";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
    title: "Terms of Service | TechVault",
    description: "TechVault terms of service — rules and guidelines for using our platform.",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen py-12 px-4">
            <div className="mx-auto max-w-3xl space-y-10">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                            <FileText className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)]">
                        Terms of Service
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Last updated: February 2026
                    </p>
                </div>

                <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
                        <p>
                            By using TechVault, you agree to these Terms of Service. If you do not agree,
                            please do not use our platform.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">2. Accounts</h2>
                        <p>
                            You are responsible for maintaining the confidentiality of your account credentials.
                            You must be at least 18 years old to create an account and make purchases.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">3. Orders & Pricing</h2>
                        <p>
                            All prices are in USD and subject to change. We reserve the right to cancel orders
                            due to pricing errors, stock issues, or suspected fraud.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">4. Intellectual Property</h2>
                        <p>
                            All content on TechVault — including logos, images, and text — is our property
                            and may not be used without permission.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">5. Limitation of Liability</h2>
                        <p>
                            TechVault is not liable for indirect, incidental, or consequential damages
                            arising from your use of our services.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">6. Changes</h2>
                        <p>
                            We may update these terms from time to time. Continued use of TechVault
                            constitutes acceptance of the updated terms.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
