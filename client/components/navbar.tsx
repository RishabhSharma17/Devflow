"use client";

import { useAuthStore } from "@/store/auth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface NavbarProps {
    title?: string;
}

export function Navbar({ title }: NavbarProps) {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const initials = user?.email
        ? user.email.substring(0, 1).toUpperCase()
        : "DF";

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/50 px-6 backdrop-blur-sm">
            <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold tracking-tight">
                    {title || "DevFlow"}
                </h1>
            </div>

            <div className="flex items-center gap-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 rounded-full outline-none ring-offset-background transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                            <Avatar className="h-12 w-12 border-2 border-violet-500/30">
                                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-xl font-semibold text-white">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="flex flex-col">
                            <span className="text-sm font-medium">My Account</span>
                            <span className="text-xs font-normal text-muted-foreground">
                                {user?.email || "user@devflow.io"}
                            </span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
