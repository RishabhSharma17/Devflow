"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { getMe } from "@/lib/api/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, isLoading, loadFromStorage, setUser, logout } =
        useAuthStore();

    useEffect(() => {
        loadFromStorage();
    }, [loadFromStorage]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
            return;
        }

        if (isAuthenticated) {
            getMe()
                .then((user) => setUser(user))
                .catch(() => {
                    logout();
                    router.push("/login");
                });
        }
    }, [isAuthenticated, isLoading, router, setUser, logout]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
