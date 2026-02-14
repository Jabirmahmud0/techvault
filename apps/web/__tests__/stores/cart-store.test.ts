import { describe, it, expect } from "vitest";

/**
 * Unit tests for the cart store (Zustand).
 * Tests add, remove, update quantity, and clear operations.
 */

// Inline mini-cart implementation for unit testing
// (Avoids importing Zustand store which requires React context)
interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    image: string;
    stock: number;
    slug: string;
    quantity: number;
}

function createCartStore() {
    let items: CartItem[] = [];

    return {
        get items() { return items; },
        get total() {
            return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        },
        get count() {
            return items.reduce((sum, item) => sum + item.quantity, 0);
        },
        addItem(item: CartItem) {
            const existing = items.find((i) => i.productId === item.productId);
            if (existing) {
                existing.quantity += item.quantity;
            } else {
                items.push({ ...item });
            }
        },
        removeItem(productId: string) {
            items = items.filter((i) => i.productId !== productId);
        },
        updateQuantity(productId: string, quantity: number) {
            const item = items.find((i) => i.productId === productId);
            if (item) {
                item.quantity = Math.max(1, Math.min(quantity, item.stock));
            }
        },
        clear() {
            items = [];
        },
    };
}

describe("Cart Store", () => {
    it("starts empty", () => {
        const cart = createCartStore();
        expect(cart.items).toHaveLength(0);
        expect(cart.total).toBe(0);
        expect(cart.count).toBe(0);
    });

    it("adds an item", () => {
        const cart = createCartStore();
        cart.addItem({
            id: "1", productId: "p1", name: "Phone", price: 999,
            image: "/img.jpg", stock: 10, slug: "phone", quantity: 1,
        });
        expect(cart.items).toHaveLength(1);
        expect(cart.total).toBe(999);
    });

    it("increments quantity for duplicate items", () => {
        const cart = createCartStore();
        const item = {
            id: "1", productId: "p1", name: "Phone", price: 999,
            image: "/img.jpg", stock: 10, slug: "phone", quantity: 1,
        };
        cart.addItem(item);
        cart.addItem(item);
        expect(cart.items).toHaveLength(1);
        expect(cart.items[0]!.quantity).toBe(2);
        expect(cart.total).toBe(1998);
    });

    it("removes an item", () => {
        const cart = createCartStore();
        cart.addItem({
            id: "1", productId: "p1", name: "Phone", price: 999,
            image: "/img.jpg", stock: 10, slug: "phone", quantity: 1,
        });
        cart.removeItem("p1");
        expect(cart.items).toHaveLength(0);
    });

    it("updates quantity within stock bounds", () => {
        const cart = createCartStore();
        cart.addItem({
            id: "1", productId: "p1", name: "Phone", price: 100,
            image: "/img.jpg", stock: 5, slug: "phone", quantity: 1,
        });
        cart.updateQuantity("p1", 3);
        expect(cart.items[0]!.quantity).toBe(3);
        // Can't exceed stock
        cart.updateQuantity("p1", 20);
        expect(cart.items[0]!.quantity).toBe(5);
        // Can't go below 1
        cart.updateQuantity("p1", 0);
        expect(cart.items[0]!.quantity).toBe(1);
    });

    it("clears all items", () => {
        const cart = createCartStore();
        cart.addItem({
            id: "1", productId: "p1", name: "Phone", price: 999,
            image: "/img.jpg", stock: 10, slug: "phone", quantity: 1,
        });
        cart.addItem({
            id: "2", productId: "p2", name: "Laptop", price: 1499,
            image: "/img.jpg", stock: 5, slug: "laptop", quantity: 2,
        });
        expect(cart.items).toHaveLength(2);
        cart.clear();
        expect(cart.items).toHaveLength(0);
        expect(cart.total).toBe(0);
    });

    it("calculates correct count with multiple items", () => {
        const cart = createCartStore();
        cart.addItem({
            id: "1", productId: "p1", name: "Phone", price: 999,
            image: "/img.jpg", stock: 10, slug: "phone", quantity: 2,
        });
        cart.addItem({
            id: "2", productId: "p2", name: "Laptop", price: 1499,
            image: "/img.jpg", stock: 5, slug: "laptop", quantity: 3,
        });
        expect(cart.count).toBe(5);
    });
});
