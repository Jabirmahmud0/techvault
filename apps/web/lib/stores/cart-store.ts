import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Cart item shape for client-side state */
export interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    stock: number;
    slug: string;
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;

    // Actions
    addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;

    // Computed
    totalItems: () => number;
    totalPrice: () => number;
}

/**
 * Zustand cart store with localStorage persistence.
 * Manages cart items, quantities, and sidebar state.
 */
export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (item) => {
                set((state) => {
                    const existing = state.items.find((i) => i.productId === item.productId);

                    if (existing) {
                        const newQty = existing.quantity + (item.quantity || 1);
                        if (newQty > existing.stock) return state;

                        return {
                            items: state.items.map((i) =>
                                i.productId === item.productId
                                    ? { ...i, quantity: newQty }
                                    : i
                            ),
                            isOpen: true,
                        };
                    }

                    return {
                        items: [...state.items, { ...item, quantity: item.quantity || 1 }],
                        isOpen: true,
                    };
                });
            },

            removeItem: (productId) => {
                set((state) => ({
                    items: state.items.filter((i) => i.productId !== productId),
                }));
            },

            updateQuantity: (productId, quantity) => {
                set((state) => ({
                    items:
                        quantity <= 0
                            ? state.items.filter((i) => i.productId !== productId)
                            : state.items.map((i) =>
                                i.productId === productId ? { ...i, quantity } : i
                            ),
                }));
            },

            clearCart: () => set({ items: [] }),
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),

            totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
            totalPrice: () =>
                get().items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0),
        }),
        {
            name: "techvault-cart",
            partialize: (state) => ({ items: state.items }),
        }
    )
);
