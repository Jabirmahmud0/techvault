import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://techvault.store";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin/", "/seller/", "/checkout/", "/api/"],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
