import { eq } from "drizzle-orm";
import { categories } from "@repo/db/schema";
import { db } from "../../config/database.js";
import { ApiError } from "../../middleware/index.js";
import type { CreateCategoryInput } from "@repo/types";

export const categoriesService = {
    /**
     * List all categories with optional product count.
     */
    async list() {
        return db.query.categories.findMany({
            with: { children: true },
            orderBy: (categories, { asc }) => [asc(categories.name)],
        });
    },

    /**
     * Get a single category by slug with its products.
     */
    async getBySlug(slug: string) {
        const category = await db.query.categories.findFirst({
            where: eq(categories.slug, slug),
            with: {
                children: true,
            },
        });

        if (!category) {
            throw ApiError.notFound("Category not found");
        }

        return category;
    },

    /**
     * Create a new category (admin only).
     */
    async create(input: CreateCategoryInput) {
        const existing = await db.query.categories.findFirst({
            where: eq(categories.slug, input.slug),
        });
        if (existing) {
            throw ApiError.conflict("A category with this slug already exists");
        }

        const [category] = await db
            .insert(categories)
            .values(input)
            .returning();

        return category;
    },
};
