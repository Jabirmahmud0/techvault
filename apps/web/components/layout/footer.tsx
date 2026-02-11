import Link from "next/link";
import { Zap } from "lucide-react";

const footerLinks = {
    Shop: [
        { label: "Smartphones", href: "/products?category=smartphones" },
        { label: "Laptops", href: "/products?category=laptops" },
        { label: "Tablets", href: "/products?category=tablets" },
        { label: "Smartwatches", href: "/products?category=smartwatches" },
        { label: "Cameras", href: "/products?category=cameras" },
    ],
    Company: [
        { label: "About Us", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Careers", href: "/careers" },
    ],
    Support: [
        { label: "FAQ", href: "/faq" },
        { label: "Shipping", href: "/shipping" },
        { label: "Returns", href: "/returns" },
        { label: "Privacy Policy", href: "/privacy" },
    ],
};

/**
 * Site footer with category links, company info, and branding.
 */
export function Footer() {
    return (
        <footer className="border-t border-border bg-card" id="site-footer">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    {/* Branding */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <Zap className="h-6 w-6 text-primary fill-primary" />
                            <span className="text-lg font-bold font-[family-name:var(--font-heading)] gradient-text">
                                TechVault
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Premium electronics at competitive prices. Shop smartphones, laptops, tablets, and more.
                        </p>
                    </div>

                    {/* Link Columns */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h3 className="text-sm font-semibold mb-3">{title}</h3>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} TechVault. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
