"use client";

import { Project } from "@/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface ProjectCardProps {
    project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const router = useRouter();

    return (
        <Card
            className="group cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 hover:-translate-y-1"
            onClick={() => router.push(`/project/${project.id}`)}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="truncate text-base font-semibold transition-colors group-hover:text-violet-500">
                            {project.name}
                        </CardTitle>
                        <CardDescription className="mt-1 line-clamp-2 text-sm">
                            {project.description || "No description"}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span>{project.members.length} member{project.members.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(new Date(project.created_at), "MMM d, yyyy")}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
