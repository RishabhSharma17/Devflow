import api from "@/lib/axios";
import { Project, CreateProjectPayload } from "@/types";

export async function getProjects(): Promise<Project[]> {
    const { data } = await api.get("/projects");
    return data;
}

export async function createProject(
    payload: CreateProjectPayload
): Promise<{ message: string; project_id: string }> {
    const { data } = await api.post("/projects", payload);
    return data;
}

export async function addMember(
    projectId: string,
    email: string
): Promise<{ message: string }> {
    const { data } = await api.post(`/projects/${projectId}/add-member`, null, {
        params: { target_user_email: email },
    });
    return data;
}

export async function removeMember(
    projectId: string,
    userId: string
): Promise<{ message: string }> {
    const { data } = await api.post(
        `/projects/${projectId}/remove-member`,
        null,
        {
            params: { user_id: userId },
        }
    );
    return data;
}

export async function updateMemberRole(
    projectId: string,
    user_id: string,
    role: string
): Promise<{ message: string }> {
    const { data } = await api.patch(
        `/projects/${projectId}/change-role`,
        null,
        {
            params: { target_user_id: user_id, role },
        }
    );
    return data;
}