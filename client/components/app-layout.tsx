"use client";

import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { TooltipProvider } from "@/components/ui/tooltip";

interface AppLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
    return (
        <TooltipProvider>
            <div className="flex h-screen overflow-hidden bg-background">
                <Sidebar />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <Navbar title={title} />
                    <main className="flex-1 overflow-y-auto p-6">{children}</main>
                </div>
            </div>
        </TooltipProvider>
    );
}
