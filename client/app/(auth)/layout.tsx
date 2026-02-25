"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { loadFromStorage, isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
        loadFromStorage();
    }, [loadFromStorage]);

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (isAuthenticated) return null;

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-background">
            {/* Gradient background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-[40%] left-1/2 h-[80%] w-[80%] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-transparent blur-3xl" />
                <div className="absolute -bottom-[20%] right-0 h-[50%] w-[50%] rounded-full bg-gradient-to-tl from-indigo-600/15 to-transparent blur-3xl" />
            </div>
            <div className="relative z-10 w-full max-w-md px-4">{children}</div>
        </div>
    );
}
