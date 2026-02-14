import { describe, it, expect } from "vitest";

/**
 * Unit tests for price formatting and product utilities.
 */

function formatPrice(price: number, currency = "USD"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(price);
}

function calculateDiscount(originalPrice: number, discountPercent: number): number {
    return originalPrice * (1 - discountPercent / 100);
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function isInStock(stock: number): boolean {
    return stock > 0;
}

function getStockStatus(stock: number): "in_stock" | "low_stock" | "out_of_stock" {
    if (stock <= 0) return "out_of_stock";
    if (stock <= 5) return "low_stock";
    return "in_stock";
}

describe("Price Formatting", () => {
    it("formats USD correctly", () => {
        expect(formatPrice(999.99)).toBe("$999.99");
    });

    it("formats zero", () => {
        expect(formatPrice(0)).toBe("$0.00");
    });

    it("formats large numbers with commas", () => {
        expect(formatPrice(1499.00)).toBe("$1,499.00");
    });
});

describe("Discount Calculation", () => {
    it("calculates 10% discount", () => {
        expect(calculateDiscount(100, 10)).toBe(90);
    });

    it("calculates 50% discount", () => {
        expect(calculateDiscount(200, 50)).toBe(100);
    });

    it("handles 0% discount", () => {
        expect(calculateDiscount(100, 0)).toBe(100);
    });

    it("handles 100% discount", () => {
        expect(calculateDiscount(100, 100)).toBe(0);
    });
});

describe("Slugify", () => {
    it("converts to lowercase kebab-case", () => {
        expect(slugify("iPhone 15 Pro Max")).toBe("iphone-15-pro-max");
    });

    it("removes special characters", () => {
        expect(slugify("Samsung Galaxy S24+")).toBe("samsung-galaxy-s24");
    });

    it("trims whitespace", () => {
        expect(slugify("  MacBook Pro  ")).toBe("macbook-pro");
    });

    it("collapses multiple separators", () => {
        expect(slugify("One--Two---Three")).toBe("one-two-three");
    });
});

describe("Stock Status", () => {
    it("returns in_stock for stock > 5", () => {
        expect(getStockStatus(10)).toBe("in_stock");
    });

    it("returns low_stock for stock 1-5", () => {
        expect(getStockStatus(3)).toBe("low_stock");
    });

    it("returns out_of_stock for stock 0", () => {
        expect(getStockStatus(0)).toBe("out_of_stock");
    });

    it("isInStock is true for positive stock", () => {
        expect(isInStock(1)).toBe(true);
    });

    it("isInStock is false for zero stock", () => {
        expect(isInStock(0)).toBe(false);
    });
});
