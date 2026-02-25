"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask } from "@/lib/api/tasks";
import { Member } from "@/types";
import { toast } from "sonner";

interface CreateTaskDialogProps {
    projectId: string;
    members: Member[];
}

export function CreateTaskDialog({ projectId, members }: CreateTaskDialogProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assignedTo, setAssignedTo] = useState<string>("");
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () =>
            createTask(projectId, {
                title,
                description: description || undefined,
                assigned_to: assignedTo || undefined,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
            toast.success("Task created successfully!");
            setOpen(false);
            setTitle("");
            setDescription("");
            setAssignedTo("");
        },
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20"
                >
                    <Plus className="h-4 w-4" />
                    Add Task
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Task</DialogTitle>
                    <DialogDescription>
                        Add a new task to this project.
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        mutation.mutate();
                    }}
                >
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="task-title">Title</Label>
                            <Input
                                id="task-title"
                                placeholder="Enter task title..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                maxLength={100}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="task-description">Description</Label>
                            <Input
                                id="task-description"
                                placeholder="Optional description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={500}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Assign To</Label>
                            <Select value={assignedTo} onValueChange={setAssignedTo}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Unassigned" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {members.map((m) => (
                                        <SelectItem key={m.user_id} value={m.user_id}>
                                            {m.user_id} ({m.role})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!title.trim() || mutation.isPending}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                        >
                            {mutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create Task
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
