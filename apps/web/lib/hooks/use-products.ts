import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice: number | null;
    image: string;
    rating: number;
    reviewCount: number;
    brand: string;
    category: string;
    isFeatured: boolean;
    description: string;
    stock: number;
    specs: Record<string, string>;
    images: string[];
}

interface ProductsResponse {
    data: Product[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export function useProducts(params?: Record<string, string | number | boolean>) {
    // create a query key that includes all params so it refetches when they change
    const queryKey = ["products", params];

    // clean up undefined params
    const cleanParams = Object.entries(params || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== "") {
            acc[key] = String(value);
        }
        return acc;
    }, {} as Record<string, string>);

    const queryString = new URLSearchParams(cleanParams).toString();

    return useQuery({
        queryKey,
        queryFn: () => api.get<ProductsResponse>(`/products?${queryString}`),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useProduct(slug: string) {
    return useQuery({
        queryKey: ["product", slug],
        queryFn: () => api.get<{ data: Product }>(`/products/${slug}`).then((res) => res.data),
        enabled: !!slug,
    });
}
