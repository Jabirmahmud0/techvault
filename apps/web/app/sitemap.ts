import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://techvault.store";

/**
 * Dynamic sitemap generation for Next.js App Router.
 * Includes static pages + dynamic product pages (fetched from API).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
        { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
        { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
        { url: `${BASE_URL}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    ];

    // Dynamic product pages
    let productPages: MetadataRoute.Sitemap = [];
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
        const res = await fetch(`${apiUrl}/products?limit=1000`, { next: { revalidate: 3600 } });
        if (res.ok) {
            const data = await res.json();
            const products = data?.data?.products || data?.data || [];
            productPages = products.map((p: any) => ({
                url: `${BASE_URL}/products/${p.slug || p.id}`,
                lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
                changeFrequency: "weekly" as const,
                priority: 0.8,
            }));
        }
    } catch {
        console.error("Sitemap: Failed to fetch products");
    }

    return [...staticPages, ...productPages];
}
