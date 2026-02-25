"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Member } from "@/types";
import { addMember, removeMember } from "@/lib/api/projects";
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
import { UserPlus, X, Loader2, Shield, User } from "lucide-react";
import { toast } from "sonner";

interface MembersPanelProps {
    projectId: string;
    members: Member[];
    isAdmin: boolean;
}

export function MembersPanel({ projectId, members, isAdmin }: MembersPanelProps) {
    const [email, setEmail] = useState("");
    const queryClient = useQueryClient();
    const currentUser = useAuthStore((s) => s.user);

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

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4" />
                    Members ({members.length})
                </CardTitle>
                <CardDescription>Manage team members for this project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        <div className="flex-1">
                            <Label htmlFor="member-email" className="sr-only">
                                Member email
                            </Label>
                            <Input
                                id="member-email"
                                type="email"
                                placeholder="Add member by email..."
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            size="icon"
                            disabled={addMutation.isPending}
                            className="shrink-0 bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                        >
                            {addMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <UserPlus className="h-4 w-4" />
                            )}
                        </Button>
                    </form>
                )}

                {/* Members list */}
                <div className="space-y-2">
                    {members.map((member) => (
                        <div
                            key={member.user_id}
                            className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 px-3 py-2.5 transition-colors hover:bg-accent/50"
                        >
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-gradient-to-br from-violet-500/20 to-indigo-500/20 text-xs font-medium">
                                        {member.user_id.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                        {member.user_id}
                                        {member.user_id === currentUser?.id && (
                                            <span className="ml-1.5 text-xs text-muted-foreground">
                                                (you)
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={member.role === "admin" ? "default" : "secondary"}
                                    className={
                                        member.role === "admin"
                                            ? "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 border-violet-500/20"
                                            : ""
                                    }
                                >
                                    {member.role === "admin" && (
                                        <Shield className="mr-1 h-3 w-3" />
                                    )}
                                    {member.role}
                                </Badge>
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
    );
}
