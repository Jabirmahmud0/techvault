import type { ProductQuery } from "@repo/types";
import { products } from "./products.data.js";
import { ApiError } from "../../middleware/index.js";

export const productsService = {
    /**
     * List products with filtering, sorting, and pagination (Mock Data).
     */
    async list(query: ProductQuery) {
        let data = [...products];
        const { page = 1, limit = 10, category, search, minPrice, maxPrice, sort, brand, featured } = query;

        // Filter
        if (search) {
            const q = search.toLowerCase();
            data = data.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
        }
        if (category) {
            data = data.filter((p) => p.category === category);
        }
        if (brand) {
            data = data.filter((p) => p.brand === brand);
        }
        if (featured !== undefined) {
            // @ts-expect-error - mock data types mismatch with strict DB types but it's fine for mock
            data = data.filter((p) => p.isFeatured === (String(featured) === "true"));
        }
        if (minPrice !== undefined) {
            data = data.filter((p) => p.price >= Number(minPrice));
        }
        if (maxPrice !== undefined) {
            data = data.filter((p) => p.price <= Number(maxPrice));
        }

        // Sort
        switch (sort) {
            case "price_asc":
                data.sort((a, b) => a.price - b.price);
                break;
            case "price_desc":
                data.sort((a, b) => b.price - a.price);
                break;
            case "rating":
                data.sort((a, b) => b.rating - a.rating);
                break;
            case "newest":
            default:
                // mock data doesn't have createdAt, so just keep order
                break;
        }

        const total = data.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const paginatedData = data.slice(offset, offset + limit);

        return {
            data: paginatedData,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    },

    /**
     * Get a single product by slug (Mock Data).
     */
    async getBySlug(slug: string) {
        const product = products.find((p) => p.slug === slug);

        if (!product) {
            throw ApiError.notFound("Product not found");
        }

        return product;
    },

    async create() { throw new Error("Not implemented in mock mode"); },
    async update() { throw new Error("Not implemented in mock mode"); },
    async getBrands() {
        const brands = new Set(products.map((p) => p.brand));
        return Array.from(brands);
    },
    async getFeatured(limit = 8) {
        return products.filter((p) => p.isFeatured).slice(0, limit);
    },
};
