import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Providers } from "@/components/providers";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartSidebar } from "@/components/cart/cart-sidebar";
import { ScrollProgress } from "@/components/animations/scroll-progress";
import { PageTransition } from "@/components/animations/page-transition";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TechVault — Premium Electronics Store",
    template: "%s | TechVault",
  },
  description:
    "Shop the latest smartphones, laptops, tablets, smartwatches, and cameras at TechVault. Premium quality tech at competitive prices.",
  keywords: [
    "electronics",
    "smartphones",
    "laptops",
    "tablets",
    "smartwatches",
    "cameras",
    "tech store",
  ],
  openGraph: {
    title: "TechVault — Premium Electronics Store",
    description:
      "Shop the latest electronics at premium quality and competitive prices.",
    siteName: "TechVault",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  name: "TechVault",
                  url: "https://techvault.store",
                  logo: "https://techvault.store/logo.png",
                  description: "Premium electronics e-commerce store offering the latest smartphones, laptops, tablets, and more.",
                  sameAs: [],
                },
                {
                  "@type": "WebSite",
                  name: "TechVault",
                  url: "https://techvault.store",
                  potentialAction: {
                    "@type": "SearchAction",
                    target: "https://techvault.store/products?search={search_term_string}",
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} antialiased`} suppressHydrationWarning>
        <Providers>
          <AuthProvider>
            <ScrollProgress />
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <CartSidebar />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
