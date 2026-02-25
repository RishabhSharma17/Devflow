export type TaskStatus = "todo" | "in_progress" | "done";

export interface Member {
    user_id: string;
    role: "admin" | "member";
}

export interface Project {
    id: string;
    name: string;
    description: string | null;
    owner_id: string;
    members: Member[];
    created_at: string;
    updated_at: string;
}

export interface Task {
    id: string;
    project_id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    created_by: string;
    assigned_to: string | null;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    email: string;
    provider: string;
}

export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export interface ApiError {
    error: string;
    detail: string;
}

export interface CreateProjectPayload {
    name: string;
    description?: string;
}

export interface CreateTaskPayload {
    title: string;
    description?: string;
    assigned_to?: string;
}

export interface UpdateTaskPayload {
    title?: string;
    description?: string;
    assigned_to?: string;
}
