"use client";

import { Task, TaskStatus } from "@/types";
import { useDroppable } from "@dnd-kit/core";
import { TaskCard } from "./task-card";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
    status: TaskStatus;
    title: string;
    tasks: Task[];
    projectId: string;
    isAdmin: boolean;
    accentColor: string;
}

export function KanbanColumn({
    status,
    title,
    tasks,
    projectId,
    isAdmin,
    accentColor,
}: KanbanColumnProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: status,
        data: { status },
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex h-full min-w-75 flex-1 flex-col rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-200",
                isOver && "border-violet-500/50 bg-violet-500/5 ring-1 ring-violet-500/20"
            )}
        >
            {/* Column header */}
            <div className="flex items-center gap-2.5 border-b border-border/50 px-4 py-3">
                <div className={`h-2.5 w-2.5 rounded-full ${accentColor}`} />
                <h3 className="text-sm font-semibold">{title}</h3>
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
                    {tasks.length}
                </span>
            </div>

            {/* Tasks */}
            <div className="flex-1 space-y-2 overflow-y-auto p-3">
                {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 py-8 text-center">
                        <p className="text-xs text-muted-foreground">No tasks</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                            Drag tasks here or create new ones
                        </p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            projectId={projectId}
                            isAdmin={isAdmin}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
