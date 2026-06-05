import { z } from "zod";

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
    token: z.string().min(1, "Token is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ─────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────

export const productQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    sortBy: z.enum(["createdAt", "price", "name"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createProductSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.coerce.number().positive("Price must be positive"),
    compareAtPrice: z.coerce.number().positive().optional(),
    category: z.string().min(1, "Category is required"),
    images: z.array(z.string()).default([]),
    inventory: z.coerce.number().int().nonnegative().default(0),
    isFeatured: z.boolean().default(false),
    specs: z.record(z.string()).default({}),
});

export const updateProductSchema = createProductSchema.partial();

export type ProductQuery = z.infer<typeof productQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// ─────────────────────────────────────────────
// Cart
// ─────────────────────────────────────────────

export const addToCartSchema = z.object({
    productId: z.string().uuid("Invalid product ID"),
    quantity: z.coerce.number().int().positive().default(1),
});

export const updateCartItemSchema = z.object({
    quantity: z.coerce.number().int().positive(),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

// ─────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────

export const createCategorySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    slug: z.string().min(2, "Slug must be at least 2 characters"),
    description: z.string().optional(),
    image: z.string().optional(),
    parentId: z.string().uuid().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

// ─────────────────────────────────────────────
// Checkout
// ─────────────────────────────────────────────

export const shippingAddressSchema = z.object({
    name: z.string().min(2, "Name is required"),
    addressLine1: z.string().min(5, "Address is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    postalCode: z.string().min(4, "Valid postal code required"),
    country: z.string().min(2, "Country is required"),
    phone: z.string().optional(),
});

export const createCheckoutSessionSchema = z.object({
    address: shippingAddressSchema,
    couponCode: z.string().optional(),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;

// ─────────────────────────────────────────────
// Reviews
// ─────────────────────────────────────────────

export const createReviewSchema = z.object({
    productId: z.string().uuid("Invalid product ID"),
    rating: z.coerce.number().int().min(1).max(5),
    title: z.string().min(2).max(100).optional(),
    comment: z.string().min(10).max(1000).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// ─────────────────────────────────────────────
// Coupons
// ─────────────────────────────────────────────

export const createCouponSchema = z.object({
    code: z.string().min(3).max(20).toUpperCase(),
    discountPercent: z.coerce.number().min(1).max(100),
    expiresAt: z.coerce.date().optional(),
    maxUses: z.coerce.number().int().positive().optional(),
});

export const applyCouponSchema = z.object({
    code: z.string().min(1, "Coupon code is required"),
    cartTotal: z.coerce.number().positive(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;

// ─────────────────────────────────────────────
// Wishlist
// ─────────────────────────────────────────────

export const toggleWishlistSchema = z.object({
    productId: z.string().uuid("Invalid product ID"),
});

export type ToggleWishlistInput = z.infer<typeof toggleWishlistSchema>;

// ─────────────────────────────────────────────
// Settings
// ─────────────────────────────────────────────

export const settingsSchema = z.object({
    storeName: z.string().min(2, "Store name is required"),
    storeEmail: z.string().email("Valid email required"),
    currency: z.string().min(3, "Currency code required"),
    taxRate: z.coerce.number().min(0).max(100),
    shippingRate: z.coerce.number().min(0),
    freeShippingThreshold: z.coerce.number().min(0).default(0),
});

export const updateSettingsSchema = settingsSchema.partial();

export type Settings = z.infer<typeof settingsSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

// ─────────────────────────────────────────────
// Profile
// ─────────────────────────────────────────────

export const updateProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email address").optional(),
    avatar: z.string().url("Invalid URL").optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ─────────────────────────────────────────────
// Contact
// ─────────────────────────────────────────────

export const contactFormSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Valid email required"),
    subject: z.string().min(5, "Subject must be at least 5 characters"),
    message: z.string().min(20, "Message must be at least 20 characters"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

// ─────────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// ─────────────────────────────────────────────
// Auth Types
// ─────────────────────────────────────────────

export type UserRole = "USER" | "SELLER" | "ADMIN";

export interface JwtPayload {
    userId: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}
