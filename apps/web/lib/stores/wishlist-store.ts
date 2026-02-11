import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
}

interface WishlistState {
    items: WishlistItem[];
    addItem: (item: WishlistItem) => void;
    removeItem: (id: string) => void;
    toggleItem: (item: WishlistItem) => void;
    isInWishlist: (id: string) => boolean;
    clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) =>
                set((state) => {
                    if (state.items.some((i) => i.id === item.id)) return state;
                    return { items: [...state.items, item] };
                }),

            removeItem: (id) =>
                set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

            toggleItem: (item) => {
                const exists = get().items.some((i) => i.id === item.id);
                if (exists) {
                    get().removeItem(item.id);
                } else {
                    get().addItem(item);
                }
            },

            isInWishlist: (id) => get().items.some((i) => i.id === id),

            clearWishlist: () => set({ items: [] }),
        }),
        { name: "techvault-wishlist" }
    )
);
