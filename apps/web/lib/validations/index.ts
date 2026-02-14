/**
 * Frontend Zod validation schemas.
 *
 * Re-exports every schema from the shared @repo/types package so that
 * frontend code has a single canonical import path (`@/lib/validations`)
 * and can be augmented with UI-only refinements when needed.
 */

// ── Re-export all shared schemas ──────────────────────────────────────────

export {
    // Auth
    loginSchema,
    registerSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    type LoginInput,
    type RegisterInput,
    type ForgotPasswordInput,
    type ResetPasswordInput,

    // Products
    productQuerySchema,
    createProductSchema,
    updateProductSchema,
    type ProductQuery,
    type CreateProductInput,
    type UpdateProductInput,

    // Cart
    addToCartSchema,
    updateCartItemSchema,
    type AddToCartInput,
    type UpdateCartItemInput,

    // Categories
    createCategorySchema,
    type CreateCategoryInput,

    // Checkout
    shippingAddressSchema,
    createCheckoutSessionSchema,
    type ShippingAddress,
    type CreateCheckoutSessionInput,

    // Reviews
    createReviewSchema,
    type CreateReviewInput,

    // Coupons
    createCouponSchema,
    applyCouponSchema,
    type CreateCouponInput,
    type ApplyCouponInput,

    // Wishlist
    toggleWishlistSchema,
    type ToggleWishlistInput,

    // Settings
    settingsSchema,
    updateSettingsSchema,
    type Settings,
    type UpdateSettingsInput,

    // Profile
    updateProfileSchema,
    type UpdateProfileInput,

    // Contact
    contactFormSchema,
    type ContactFormInput,

    // API types
    type ApiResponse,
    type PaginatedResponse,
    type UserRole,
    type JwtPayload,
} from "@repo/types";
