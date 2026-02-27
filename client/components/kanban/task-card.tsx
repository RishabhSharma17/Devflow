"use client";

import { Task, TaskStatus } from "@/types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Trash2, User } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTask } from "@/lib/api/tasks";
import { toast } from "sonner";

interface TaskCardProps {
    task: Task;
    projectId: string;
    isAdmin: boolean;
}

export function TaskCard({ task, projectId, isAdmin }: TaskCardProps) {
    const queryClient = useQueryClient();

    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: task.id,
            data: {
                task,
                status: task.status,
            },
        });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    };

    const deleteMutation = useMutation({
        mutationFn: () => deleteTask(projectId, task.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
            toast.success("Task deleted.");
        },
    });

    return (
        <div ref={setNodeRef} style={style}>
            <Card
                className={`group border-border/50 bg-background/80 backdrop-blur-sm transition-all duration-200 hover:border-violet-500/20 hover:shadow-sm ${isDragging ? "shadow-lg ring-2 ring-violet-500/30" : ""
                    }`}
            >
                <CardHeader className="flex flex-row items-start gap-2 p-3 pb-1">
                    <button
                        {...listeners}
                        {...attributes}
                        className="mt-0.5 cursor-grab rounded p-0.5 text-muted-foreground/50 transition-colors hover:text-muted-foreground active:cursor-grabbing"
                    >
                        <GripVertical className="h-4 w-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium leading-tight">
                            {task.title}
                        </CardTitle>
                    </div>
                    {isAdmin && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 cursor-pointer shrink-0 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteMutation.mutate();
                            }}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="px-3 pb-3 pt-0 pl-9">
                    {task.description && (
                        <CardDescription className="mb-2 line-clamp-2 text-xs">
                            {task.description}
                        </CardDescription>
                    )}
                    {task.assigned_to && (
                        <span>
                            <span className="h-2.5 w-2.5 text-sm">Assigned to : </span>
                            <Badge
                                variant="secondary"
                                className="gap-1 text-sm font-normal"
                            >
                                <User className="h-1.5 w-1.5" />
                                {task.assigned_to}
                            </Badge>
                        </span>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
