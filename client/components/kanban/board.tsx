"use client";

import { Task, TaskStatus } from "@/types";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from "@dnd-kit/core";
import { useState } from "react";
import { KanbanColumn } from "./column";
import { TaskCard } from "./task-card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTaskStatus } from "@/lib/api/tasks";
import { toast } from "sonner";

interface KanbanBoardProps {
    tasks: Task[];
    projectId: string;
    isAdmin: boolean;
}

const columns: { status: TaskStatus; title: string; accent: string }[] = [
    { status: "todo", title: "To Do", accent: "bg-blue-500" },
    { status: "in_progress", title: "In_Progress", accent: "bg-amber-500" },
    { status: "done", title: "Done", accent: "bg-emerald-500" },
];

export function KanbanBoard({ tasks, projectId, isAdmin }: KanbanBoardProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const queryClient = useQueryClient();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const statusMutation = useMutation({
        mutationFn: ({
            taskId,
            newStatus,
        }: {
            taskId: string;
            newStatus: TaskStatus;
        }) => updateTaskStatus(projectId, taskId, newStatus),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
        },
        onError: () => {
            // Re-fetch to revert optimistic update
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
        },
    });

    const handleDragStart = (event: DragStartEvent) => {
        const task = event.active.data.current?.task as Task;
        if (task) {
            setActiveTask(task);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);

        const { active, over } = event;
        if (!over) return;

        const taskData = active.data.current;
        const targetStatus = over.data.current?.status as TaskStatus | undefined;

        if (!taskData || !targetStatus) return;
        if (taskData.status === targetStatus) return;

        // Optimistically update
        queryClient.setQueryData<Task[]>(["tasks", projectId], (old) => {
            if (!old) return old;
            return old.map((t) =>
                t.id === active.id ? { ...t, status: targetStatus } : t
            );
        });

        statusMutation.mutate({
            taskId: active.id as string,
            newStatus: targetStatus,
        });

        toast.success(
            `Task moved to ${columns.find((c) => c.status === targetStatus)?.title}`
        );
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {columns.map((col) => (
                    <KanbanColumn
                        key={col.status}
                        status={col.status}
                        title={col.title}
                        accentColor={col.accent}
                        tasks={tasks.filter((t) => t.status === col.status)}
                        projectId={projectId}
                        isAdmin={isAdmin}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeTask && (
                    <div className="w-70 rotate-3 scale-105">
                        <TaskCard
                            task={activeTask}
                            projectId={projectId}
                            isAdmin={isAdmin}
                        />
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}
