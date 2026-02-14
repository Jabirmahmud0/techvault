import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Browse Categories",
    description:
        "Explore our curated collection of premium electronics — smartphones, laptops, tablets, smartwatches, cameras, and headphones at TechVault.",
    openGraph: {
        title: "Browse Categories | TechVault",
        description:
            "Shop by category — smartphones, laptops, tablets, smartwatches, cameras, and more.",
    },
};

export default function CategoriesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
