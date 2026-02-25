"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/lib/api/projects";
import { ProjectCard } from "@/components/project-card";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { AppLayout } from "@/components/app-layout";
import { AuthGuard } from "@/components/auth-guard";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderKanban } from "lucide-react";

export default function DashboardPage() {
    const {
        data: projects,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["projects"],
        queryFn: getProjects,
    });

    return (
        <AuthGuard>
            <AppLayout title="Dashboard">
                <div className="mx-auto max-w-6xl space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
                            <p className="text-sm text-muted-foreground">
                                Manage and organize your team projects
                            </p>
                        </div>
                        <CreateProjectDialog />
                    </div>

                    {/* Loading */}
                    {isLoading && (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="rounded-xl border border-border/50 p-6">
                                    <Skeleton className="mb-2 h-5 w-3/4" />
                                    <Skeleton className="mb-4 h-4 w-full" />
                                    <div className="flex gap-4">
                                        <Skeleton className="h-3 w-20" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && projects && projects.length === 0 && (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-card/30 py-16">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10">
                                <FolderKanban className="h-7 w-7 text-violet-500" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
                            <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
                                Create your first project to start organizing tasks and collaborating with your team.
                            </p>
                            <div className="mt-6">
                                <CreateProjectDialog />
                            </div>
                        </div>
                    )}

                    {/* Project Grid */}
                    {!isLoading && projects && projects.length > 0 && (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {projects.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    )}
                </div>
            </AppLayout>
        </AuthGuard>
    );
}
