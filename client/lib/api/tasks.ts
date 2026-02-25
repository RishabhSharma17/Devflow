import api from "@/lib/axios";
import {
    Task,
    TaskStatus,
    CreateTaskPayload,
    UpdateTaskPayload,
} from "@/types";

interface GetTasksParams {
    skip?: number;
    limit?: number;
    status?: TaskStatus;
}

export async function getTasks(
    projectId: string,
    params?: GetTasksParams
): Promise<Task[]> {
    const { data } = await api.get("/tasks", {
        params: { project_id: projectId, ...params },
    });
    return data;
}

export async function createTask(
    projectId: string,
    payload: CreateTaskPayload
): Promise<Task> {
    const { data } = await api.post("/tasks", payload, {
        params: { project_id: projectId },
    });
    return data;
}

export async function updateTask(
    projectId: string,
    taskId: string,
    payload: UpdateTaskPayload
): Promise<Task> {
    const { data } = await api.patch(`/tasks/${taskId}`, payload, {
        params: { project_id: projectId },
    });
    return data;
}

export async function updateTaskStatus(
    projectId: string,
    taskId: string,
    status: TaskStatus
): Promise<Task> {
    const { data } = await api.patch(
        `/tasks/${taskId}/status`,
        { status },
        { params: { project_id: projectId } }
    );
    return data;
}

export async function deleteTask(
    projectId: string,
    taskId: string
): Promise<{ message: string }> {
    const { data } = await api.delete(`/tasks/${taskId}`, {
        params: { project_id: projectId },
    });
    return data;
}
