import type { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://techvault.store";

async function getProduct(slug: string) {
    try {
        const res = await fetch(`${API_URL}/products/${slug}`, {
            next: { revalidate: 300, tags: [`product-${slug}`] },
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data || json;
    } catch {
        return null;
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return {
            title: "Product Not Found",
            description: "The product you're looking for doesn't exist.",
        };
    }

    const imageUrl =
        product.images?.[0]?.url ||
        product.images?.[0] ||
        `${SITE_URL}/og-default.png`;

    // Dynamic OG image with product metadata
    const ogImageUrl = `${SITE_URL}/api/og?title=${encodeURIComponent(product.name)}${product.price ? `&price=${product.price}` : ""}${product.brand ? `&brand=${encodeURIComponent(product.brand)}` : ""}${product.rating ? `&rating=${product.rating}` : ""}${product.category?.name ? `&category=${encodeURIComponent(product.category.name)}` : ""}`;

    return {
        title: product.name,
        description:
            product.description?.slice(0, 160) ||
            `Buy ${product.name} at TechVault. Premium electronics at competitive prices.`,
        keywords: [
            product.name,
            product.brand,
            product.category?.name,
            "electronics",
            "buy online",
        ].filter(Boolean) as string[],
        openGraph: {
            title: product.name,
            description:
                product.description?.slice(0, 160) ||
                `Shop ${product.name} at TechVault`,
            url: `${SITE_URL}/products/${slug}`,
            siteName: "TechVault",
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: product.name,
                },
            ],
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: product.name,
            description: product.description?.slice(0, 160),
            images: [ogImageUrl],
        },
    };
}

export default async function ProductDetailLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const product = await getProduct(slug);

    // Product JSON-LD structured data
    const jsonLd = product
        ? {
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            image:
                product.images?.map(
                    (img: any) => img?.url || img
                ) || [],
            brand: {
                "@type": "Brand",
                name: product.brand || "TechVault",
            },
            sku: product.id,
            offers: {
                "@type": "Offer",
                url: `${SITE_URL}/products/${slug}`,
                priceCurrency: "USD",
                price: product.price,
                availability:
                    product.stock > 0
                        ? "https://schema.org/InStock"
                        : "https://schema.org/OutOfStock",
                seller: {
                    "@type": "Organization",
                    name: "TechVault",
                },
            },
            aggregateRating:
                product.reviewCount > 0
                    ? {
                        "@type": "AggregateRating",
                        ratingValue: product.rating,
                        reviewCount: product.reviewCount,
                    }
                    : undefined,
        }
        : null;

    // BreadcrumbList JSON-LD
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: SITE_URL,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "Products",
                item: `${SITE_URL}/products`,
            },
            ...(product
                ? [
                    {
                        "@type": "ListItem",
                        position: 3,
                        name: product.name,
                        item: `${SITE_URL}/products/${slug}`,
                    },
                ]
                : []),
        ],
    };

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(jsonLd),
                    }}
                />
            )}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbJsonLd),
                }}
            />
            {children}
        </>
    );
}
