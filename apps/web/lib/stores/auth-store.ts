import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
    id: string;
    name: string;
    email: string;
    role: "USER" | "SELLER" | "ADMIN";
    image?: string | null;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    hasHydrated: boolean;
    userCheckComplete: boolean;
    setAuth: (user: User, accessToken: string) => void;
    updateUser: (user: Partial<User>) => void;
    logout: () => void;
    setHasHydrated: (state: boolean) => void;
    setUserCheckComplete: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            hasHydrated: false,
            userCheckComplete: false,

            setAuth: (user, accessToken) =>
                set({ user, accessToken, isAuthenticated: true }),

            setHasHydrated: (state) => set({ hasHydrated: state }),

            setUserCheckComplete: (state) => set({ userCheckComplete: state }),

            updateUser: (updates) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                })),

            logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
