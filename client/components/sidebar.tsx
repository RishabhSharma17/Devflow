"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
    LayoutDashboard,
    LogOut,
    Moon,
    Sun,
    Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const logout = useAuthStore((s) => s.logout);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <aside className="flex h-screen w-[68px] flex-col items-center border-r border-border bg-card py-4">
            {/* Logo */}
            <Link href="/dashboard" className="mb-6 flex items-center justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25">
                    <Zap className="h-5 w-5 text-white" />
                </div>
            </Link>

            <Separator className="mb-4 w-10" />

            {/* Nav Links */}
            <nav className="flex flex-1 flex-col items-center gap-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Tooltip key={item.href} delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-md"
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={8}>
                                {item.label}
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </nav>

            {/* Footer Actions */}
            <div className="flex flex-col items-center gap-2">
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        >
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                        Toggle theme
                    </TooltipContent>
                </Tooltip>

                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 cursor-pointer rounded-lg text-muted-foreground hover:text-destructive"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                        Logout
                    </TooltipContent>
                </Tooltip>
            </div>
        </aside>
    );
}
