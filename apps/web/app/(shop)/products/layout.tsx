import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "All Products",
    description:
        "Browse our full catalog of premium electronics — smartphones, laptops, tablets, smartwatches, cameras, and more. Free shipping on all orders.",
    openGraph: {
        title: "Shop All Products | TechVault",
        description:
            "Discover premium electronics at competitive prices. Filter by category, price, and brand.",
    },
};

export default function ProductsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
