import {
    pgTable,
    uuid,
    varchar,
    text,
    integer,
    decimal,
    boolean,
    timestamp,
    pgEnum,
    uniqueIndex,
    index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Enums ──────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["USER", "SELLER", "ADMIN"]);
export const orderStatusEnum = pgEnum("order_status", [
    "PENDING",
    "PAID",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
]);

// ── Users ──────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash"),
    image: text("image"),
    role: userRoleEnum("role").default("USER").notNull(),
    authProvider: text("auth_provider", { enum: ["EMAIL", "GOOGLE"] }).default("EMAIL"),
    googleId: varchar("google_id", { length: 255 }).unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
    products: many(products),
    cartItems: many(cartItems),
    wishlists: many(wishlists),
    orders: many(orders),
    reviews: many(productReviews),
    addresses: many(addresses),
}));

// ── Categories ─────────────────────────────────────────────────────────────

export const categories = pgTable(
    "categories",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: varchar("name", { length: 255 }).notNull(),
        slug: varchar("slug", { length: 255 }).notNull().unique(),
        description: text("description"),
        image: text("image"),
        parentId: uuid("parent_id"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("categories_slug_idx").on(table.slug),
    ]
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
    parent: one(categories, {
        fields: [categories.parentId],
        references: [categories.id],
        relationName: "categoryParent",
    }),
    children: many(categories, { relationName: "categoryParent" }),
    products: many(products),
}));

// ── Products ───────────────────────────────────────────────────────────────

export const products = pgTable(
    "products",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: varchar("name", { length: 500 }).notNull(),
        slug: varchar("slug", { length: 500 }).notNull().unique(),
        description: text("description").notNull(),
        shortDescription: varchar("short_description", { length: 500 }),
        price: decimal("price", { precision: 10, scale: 2 }).notNull(),
        compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
        stock: integer("stock").default(0).notNull(),
        sku: varchar("sku", { length: 100 }),
        brand: varchar("brand", { length: 255 }),
        categoryId: uuid("category_id")
            .references(() => categories.id, { onDelete: "set null" }),
        sellerId: uuid("seller_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        isFeatured: boolean("is_featured").default(false).notNull(),
        isArchived: boolean("is_archived").default(false).notNull(),
        rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
        reviewCount: integer("review_count").default(0).notNull(),
        specifications: text("specifications"), // JSON string for flexible specs
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("products_slug_idx").on(table.slug),
        index("products_category_idx").on(table.categoryId),
        index("products_price_idx").on(table.price),
        index("products_created_at_idx").on(table.createdAt),
        index("products_seller_idx").on(table.sellerId),
        index("products_featured_idx").on(table.isFeatured),
    ]
);

export const productsRelations = relations(products, ({ one, many }) => ({
    category: one(categories, {
        fields: [products.categoryId],
        references: [categories.id],
    }),
    seller: one(users, {
        fields: [products.sellerId],
        references: [users.id],
    }),
    images: many(productImages),
    reviews: many(productReviews),
    cartItems: many(cartItems),
    wishlists: many(wishlists),
    orderItems: many(orderItems),
}));

// ── Product Images ─────────────────────────────────────────────────────────

export const productImages = pgTable("product_images", {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
        .references(() => products.id, { onDelete: "cascade" })
        .notNull(),
    url: text("url").notNull(),
    publicId: varchar("public_id", { length: 500 }), // Cloudinary public_id
    altText: varchar("alt_text", { length: 255 }),
    isPrimary: boolean("is_primary").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const productImagesRelations = relations(productImages, ({ one }) => ({
    product: one(products, {
        fields: [productImages.productId],
        references: [products.id],
    }),
}));

// ── Product Reviews ────────────────────────────────────────────────────────

export const productReviews = pgTable(
    "product_reviews",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        productId: uuid("product_id")
            .references(() => products.id, { onDelete: "cascade" })
            .notNull(),
        userId: uuid("user_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        rating: integer("rating").notNull(), // 1-5
        title: varchar("title", { length: 255 }),
        comment: text("comment"),
        isVerifiedPurchase: boolean("is_verified_purchase").default(false).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("reviews_product_idx").on(table.productId),
        index("reviews_user_idx").on(table.userId),
    ]
);

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
    product: one(products, {
        fields: [productReviews.productId],
        references: [products.id],
    }),
    user: one(users, {
        fields: [productReviews.userId],
        references: [users.id],
    }),
}));

// ── Cart Items ─────────────────────────────────────────────────────────────

export const cartItems = pgTable(
    "cart_items",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        productId: uuid("product_id")
            .references(() => products.id, { onDelete: "cascade" })
            .notNull(),
        quantity: integer("quantity").default(1).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("cart_items_user_product_idx").on(table.userId, table.productId),
    ]
);

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
    user: one(users, {
        fields: [cartItems.userId],
        references: [users.id],
    }),
    product: one(products, {
        fields: [cartItems.productId],
        references: [products.id],
    }),
}));

// ── Wishlists ──────────────────────────────────────────────────────────────

export const wishlists = pgTable(
    "wishlists",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        productId: uuid("product_id")
            .references(() => products.id, { onDelete: "cascade" })
            .notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("wishlists_user_product_idx").on(table.userId, table.productId),
    ]
);

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
    user: one(users, {
        fields: [wishlists.userId],
        references: [users.id],
    }),
    product: one(products, {
        fields: [wishlists.productId],
        references: [products.id],
    }),
}));

// ── Orders ─────────────────────────────────────────────────────────────────

export const orders = pgTable("orders", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    stripeSessionId: text("stripe_session_id").unique(),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    status: text("status", { enum: ["PENDING", "PAID", "FAILED"] })
        .default("PENDING")
        .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
    user: one(users, {
        fields: [orders.userId],
        references: [users.id],
    }),
    items: many(orderItems),
}));

// ── Order Items ────────────────────────────────────────────────────────────

export const orderItems = pgTable("order_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
        .notNull()
        .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
        .notNull()
        .references(() => products.id),
    productName: text("product_name").notNull(),
    productImage: text("product_image"),
    quantity: integer("quantity").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),
    product: one(products, {
        fields: [orderItems.productId],
        references: [products.id],
    }),
}));

// ── Orders ─────────────────────────────────────────────────────────────────



// ── Coupons ────────────────────────────────────────────────────────────────

export const coupons = pgTable("coupons", {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    discountPercent: integer("discount_percent").notNull(), // 1-100
    maxUses: integer("max_uses"),
    usesCount: integer("uses_count").default(0).notNull(),
    minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Addresses ──────────────────────────────────────────────────────────────

export const addresses = pgTable(
    "addresses",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        label: varchar("label", { length: 100 }), // "Home", "Office"
        fullName: varchar("full_name", { length: 255 }).notNull(),
        line1: varchar("line1", { length: 500 }).notNull(),
        line2: varchar("line2", { length: 500 }),
        city: varchar("city", { length: 255 }).notNull(),
        state: varchar("state", { length: 255 }),
        postalCode: varchar("postal_code", { length: 20 }).notNull(),
        country: varchar("country", { length: 100 }).notNull(),
        phone: varchar("phone", { length: 20 }),
        isDefault: boolean("is_default").default(false).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("addresses_user_idx").on(table.userId),
    ]
);

export const addressesRelations = relations(addresses, ({ one }) => ({
    user: one(users, {
        fields: [addresses.userId],
        references: [users.id],
    }),
}));
