import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    setTokens: (accessToken: string, refreshToken: string) => void;
    setUser: (user: User) => void;
    logout: () => void;
    loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,

    setTokens: (accessToken, refreshToken) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("access_token", accessToken);
            localStorage.setItem("refresh_token", refreshToken);
        }
        set({
            accessToken,
            refreshToken,
            isAuthenticated: true,
        });
    },

    setUser: (user) => {
        set({ user });
    },

    logout: () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
        }
        set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
        });
    },

    loadFromStorage: () => {
        if (typeof window !== "undefined") {
            const accessToken = localStorage.getItem("access_token");
            const refreshToken = localStorage.getItem("refresh_token");
            if (accessToken && refreshToken) {
                set({
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                set({ isLoading: false });
            }
        }
    },
}));
