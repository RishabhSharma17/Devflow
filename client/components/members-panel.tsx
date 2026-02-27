"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Member } from "@/types";
import { addMember, removeMember, updateMemberRole } from "@/lib/api/projects";
import { useAuthStore } from "@/store/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, X, Loader2, Shield, User, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { getAllUsers } from "@/lib/api/auth";


interface MembersPanelProps {
    projectId: string;
    members: Member[];
    isAdmin: boolean;
}

export function MembersPanel({ projectId, members, isAdmin }: MembersPanelProps) {
    const [email, setEmail] = useState("");
    const queryClient = useQueryClient();
    const currentUser = useAuthStore((s) => s.user);
    const { data: users = []} = useQuery({
        queryKey: ["users"],
        queryFn: getAllUsers,
    });
    const [isFocused, setIsFocused] = useState(false);
    const memberEmails = members.map((m) => m.user_email);
    const filterUsers = users.filter((u) => {
    const alreadyMember = memberEmails.includes(u.email);
    const isCurrentUser = u.id === currentUser?.id;

    if (alreadyMember || isCurrentUser) return false;

    if (!email.trim()) return true;

    return u.email.toLowerCase().includes(email.toLowerCase());
    });

    const visibleUsers = filterUsers.slice(0, 8);
    const [openRoleFor, setOpenRoleFor] = useState<string | null>(null);
    const addMutation = useMutation({
        mutationFn: (memberEmail: string) => addMember(projectId, memberEmail),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Member added successfully!");
            setEmail("");
        },
    });

    const removeMutation = useMutation({
        mutationFn: (userId: string) => removeMember(projectId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Member removed successfully.");
        },
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ user_id, role }: { user_id: string; role: string }) =>
            updateMemberRole(projectId, user_id, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Role updated");
        },
    });

    return (
        <div className="flex flex-row  justify-between">
            <Card className="w-3/5 h-[500px] flex flex-col border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <User className="h-4 w-4" />
                        Members ({members.length})
                    </CardTitle>
                    <CardDescription>
                        Manage team members for this project
                    </CardDescription>
                </CardHeader>
                {/* Make this area scrollable */}
                <CardContent className="flex-1 overflow-y-auto min-h-0 space-y-4">
                    <div className="space-y-2">
                        {members.map((member) => (
                            <div
                                key={member.user_id}
                                className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 px-3 py-2.5 transition-colors hover:bg-accent/50"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-gradient-to-br from-violet-500/20 to-indigo-500/20 text-xs font-medium">
                                            {member.user_email.substring(0, 1).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">
                                            {member.user_email}
                                            {member.user_id === currentUser?.id && (
                                                <span className="ml-1.5 text-xs text-muted-foreground">
                                                    (you)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 relative">
                                        {/* Static Role Badge */}
                                        <Badge
                                            variant={member.role === "admin" ? "default" : "secondary"}
                                            className={
                                            member.role === "admin"
                                                ? "bg-violet-500/10 text-violet-500 border-violet-500/20"
                                                : ""
                                            }
                                        >
                                            {member.role === "admin" && (
                                            <Shield className="mr-1 h-3 w-3" />
                                            )}
                                            {member.role}
                                        </Badge>

                                        {/* Three Dots Button (Admin Only) */}
                                        {isAdmin && member.user_id !== currentUser?.id && (
                                            <button
                                                onClick={() =>
                                                    setOpenRoleFor(
                                                    openRoleFor === member.user_id
                                                        ? null
                                                        : member.user_id
                                                    )
                                                }
                                                className="p-1 cursor-pointer rounded-md hover:bg-accent"
                                                >
                                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                        )}

                                        {/* Dropdown */}
                                        {isAdmin && openRoleFor === member.user_id && (
                                            <div className="absolute  right-0 top-7 w-24 rounded-md border bg-background shadow-md z-50">
                                            {["member", "admin"].map((role) => (
                                                <div
                                                    key={role}
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => {
                                                        updateRoleMutation.mutate({
                                                        user_id: member.user_id,
                                                        role,
                                                        });
                                                        setOpenRoleFor(null);
                                                    }}
                                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent"
                                                    >
                                                    {role}
                                                </div>
                                            ))}
                                            </div>
                                        )}
                                    </div>
                                    {isAdmin && member.user_id !== currentUser?.id && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                            disabled={removeMutation.isPending}
                                            onClick={() => removeMutation.mutate(member.user_id)}
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card className="w-2/6 h-20 border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent>
                        {/* Add member form (admin only) */}
                        {isAdmin && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (email.trim()) {
                                        addMutation.mutate(email.trim());
                                    }
                                }}
                                className="flex gap-2"
                            >
                                <div className="flex-1 relative">
                                    <Label htmlFor="member-email" className="sr-only">
                                        Member email
                                    </Label>
                                    <Input
                                        id="member-email"
                                        type="email"
                                        placeholder="Add member by email..."
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() =>
                                            setTimeout(
                                            () => setIsFocused(false),
                                            150
                                            )
                                        }
                                        autoComplete="off"
                                        required
                                    />
                                    {/* Dropdown */}
                                    {isFocused && filterUsers.length > 0 && (
                                        <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-md max-h-40 overflow-y-auto">
                                        {visibleUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                onClick={() => {
                                                    setEmail(user.email);
                                                    setIsFocused(false);
                                                }}
                                                className="cursor-pointer px-3 py-2 text-sm hover:bg-accent"
                                                >
                                                {user.email}
                                            </div>
                                        ))}
                                        </div>
                                    )}
                                </div>
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={addMutation.isPending}
                                    className="shrink-0 cursor-pointer bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                                >
                                    {addMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <UserPlus className="h-4 w-4" />
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
            </Card>
        </div>
    );
}
