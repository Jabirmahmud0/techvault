import { describe, it, expect } from "vitest";

/**
 * Unit tests for the wishlist store logic.
 */

function createWishlistStore() {
    let items: string[] = [];

    return {
        get items() { return items; },
        isInWishlist(productId: string) {
            return items.includes(productId);
        },
        toggleItem(productId: string) {
            if (items.includes(productId)) {
                items = items.filter((id) => id !== productId);
            } else {
                items.push(productId);
            }
        },
        clear() {
            items = [];
        },
    };
}

describe("Wishlist Store", () => {
    it("starts empty", () => {
        const wishlist = createWishlistStore();
        expect(wishlist.items).toHaveLength(0);
    });

    it("adds item to wishlist", () => {
        const wishlist = createWishlistStore();
        wishlist.toggleItem("p1");
        expect(wishlist.isInWishlist("p1")).toBe(true);
        expect(wishlist.items).toHaveLength(1);
    });

    it("removes item from wishlist on second toggle", () => {
        const wishlist = createWishlistStore();
        wishlist.toggleItem("p1");
        wishlist.toggleItem("p1");
        expect(wishlist.isInWishlist("p1")).toBe(false);
        expect(wishlist.items).toHaveLength(0);
    });

    it("handles multiple products", () => {
        const wishlist = createWishlistStore();
        wishlist.toggleItem("p1");
        wishlist.toggleItem("p2");
        wishlist.toggleItem("p3");
        expect(wishlist.items).toHaveLength(3);
        expect(wishlist.isInWishlist("p2")).toBe(true);
    });

    it("clears wishlist", () => {
        const wishlist = createWishlistStore();
        wishlist.toggleItem("p1");
        wishlist.toggleItem("p2");
        wishlist.clear();
        expect(wishlist.items).toHaveLength(0);
    });
});
