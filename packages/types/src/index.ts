import { z } from "zod";

// ── API Response Types ─────────────────────────────────────────────────────

/** Standard API success response */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

/** Paginated API response */
export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

// ── Auth Schemas ───────────────────────────────────────────────────────────

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(255),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// ── Product Schemas ────────────────────────────────────────────────────────

export const productQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(12),
    category: z.string().optional(),
    search: z.string().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    sort: z.enum(["price_asc", "price_desc", "newest", "rating", "name"]).default("newest"),
    brand: z.string().optional(),
    featured: z.coerce.boolean().optional(),
});

export const createProductSchema = z.object({
    name: z.string().min(1).max(500),
    slug: z.string().min(1).max(500),
    description: z.string().min(1),
    shortDescription: z.string().max(500).optional(),
    price: z.coerce.number().positive(),
    compareAtPrice: z.coerce.number().positive().optional(),
    stock: z.coerce.number().int().nonnegative().default(0),
    sku: z.string().max(100).optional(),
    brand: z.string().max(255).optional(),
    categoryId: z.string().uuid(),
    isFeatured: z.boolean().default(false),
    specifications: z.string().optional(),
    images: z.array(z.string().url()).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type ProductQuery = z.infer<typeof productQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// ── Cart Schemas ───────────────────────────────────────────────────────────

export const addToCartSchema = z.object({
    productId: z.string().uuid(),
    quantity: z.coerce.number().int().positive().max(99).default(1),
});

export const updateCartItemSchema = z.object({
    quantity: z.coerce.number().int().positive().max(99),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

// ── Category Schemas ───────────────────────────────────────────────────────

export const createCategorySchema = z.object({
    name: z.string().min(1).max(255),
    slug: z.string().min(1).max(255),
    description: z.string().optional(),
    image: z.string().url().optional(),
    parentId: z.string().uuid().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

// ── User Role Type ─────────────────────────────────────────────────────────

export type UserRole = "USER" | "SELLER" | "ADMIN";

// ── JWT Payload ────────────────────────────────────────────────────────────

export interface JwtPayload {
    userId: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}
