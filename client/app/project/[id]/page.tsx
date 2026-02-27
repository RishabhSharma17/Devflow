"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/lib/api/projects";
import { getTasks } from "@/lib/api/tasks";
import { useAuthStore } from "@/store/auth";
import { AppLayout } from "@/components/app-layout";
import { AuthGuard } from "@/components/auth-guard";
import { KanbanBoard } from "@/components/kanban/board";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { MembersPanel } from "@/components/members-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, KanbanSquare, Users } from "lucide-react";
import Link from "next/link";

export default function ProjectPage() {
    const params = useParams();
    const projectId = params.id as string;
    const currentUser = useAuthStore((s) => s.user);

    const { data: projects, isLoading: projectsLoading } = useQuery({
        queryKey: ["projects"],
        queryFn: getProjects,
    });

    const project = projects?.find((p) => p.id === projectId);

    const { data: tasks = [], isLoading: tasksLoading } = useQuery({
        queryKey: ["tasks", projectId],
        queryFn: () => getTasks(projectId),
        enabled: !!projectId,
    });

    console.log(tasks)

    const isAdmin =
        project?.members.some(
            (m) => m.user_id === currentUser?.id && m.role === "admin"
        ) ?? false;

    const isLoading = projectsLoading || tasksLoading;

    return (
        <AuthGuard>
            <AppLayout title={project?.name || "Project"}>
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">
                                    {project?.name || <Skeleton className="inline-block h-7 w-40" />}
                                </h2>
                                {project?.description && (
                                    <p className="text-sm text-muted-foreground">
                                        {project.description}
                                    </p>
                                )}
                            </div>
                        </div>
                        {isAdmin && project && (
                            <CreateTaskDialog
                                projectId={projectId}
                                members={project.members}
                            />
                        )}
                    </div>

                    {/* Tabs: Board & Members */}
                    <Tabs defaultValue="board" className="space-y-4">
                        <TabsList className="bg-card/50">
                            <TabsTrigger value="board" className="gap-1.5 cursor-pointer">
                                <KanbanSquare className="h-4 w-4" />
                                Board
                            </TabsTrigger>
                            <TabsTrigger value="members" className="gap-1.5 cursor-pointer">
                                <Users className="h-4 w-4" />
                                Members
                                {project && (
                                    <span className="ml-1 text-xs text-muted-foreground">
                                        ({project.members.length})
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="board" className="mt-0">
                            {isLoading ? (
                                <div className="flex gap-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex-1 rounded-xl border border-border/50 p-4"
                                        >
                                            <Skeleton className="mb-4 h-5 w-24" />
                                            <div className="space-y-3">
                                                <Skeleton className="h-20 w-full rounded-lg" />
                                                <Skeleton className="h-20 w-full rounded-lg" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-[calc(100vh-280px)]">
                                    <KanbanBoard
                                        tasks={tasks}
                                        projectId={projectId}
                                        isAdmin={isAdmin}
                                    />
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="members" className="mt-0">
                            {project ? (
                                <div className="min-h-100">
                                    <MembersPanel
                                        projectId={projectId}
                                        members={project.members}
                                        isAdmin={isAdmin}
                                    />
                                </div>
                            ) : (
                                <Skeleton className="h-48 w-full max-w-xl rounded-xl" />
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </AppLayout>
        </AuthGuard>
    );
}
