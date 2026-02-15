import { Metadata } from "next";
import { Briefcase } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Careers | TechVault",
    description: "Join the TechVault team — we're always looking for talented people.",
};

export default function CareersPage() {
    return (
        <div className="min-h-screen py-12 px-4">
            <div className="mx-auto max-w-3xl space-y-10">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                            <Briefcase className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)]">
                        Careers at TechVault
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        We&apos;re building the future of electronics e-commerce. Want to be a part of it?
                    </p>
                </div>

                {/* No openings placeholder */}
                <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-4">
                    <h2 className="text-xl font-bold font-[family-name:var(--font-heading)]">
                        No Open Positions Right Now
                    </h2>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                        We don&apos;t have any openings at the moment, but we&apos;re always interested in hearing
                        from talented people. Send your resume to{" "}
                        <a href="mailto:careers@techvault.com" className="text-primary hover:underline">
                            careers@techvault.com
                        </a>{" "}
                        and we&apos;ll keep it on file.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-block text-sm text-primary hover:underline"
                    >
                        Contact us →
                    </Link>
                </div>
            </div>
        </div>
    );
}
