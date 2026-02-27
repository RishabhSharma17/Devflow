import api from "@/lib/axios";
import { AuthTokens, User } from "@/types";

export async function loginUser(
    email: string,
    password: string
): Promise<AuthTokens> {
    const { data } = await api.post("/users/login", { email, password });
    return data;
}

export async function registerUser(
    email: string,
    password: string
): Promise<{ message: string; user_id: string }> {
    const { data } = await api.post("/users/register", { email, password });
    return data;
}

export async function getMe(): Promise<User> {
    const { data } = await api.get("/users/me");
    return data;
}

export async function getAllUsers(): Promise<User[]> {
    const { data } = await api.get("/users/all");
    return data;
}

export async function refreshAccessToken(
    refreshToken: string
): Promise<{ access_token: string; token_type: string }> {
    const { data } = await api.post("/users/refresh", null, {
        params: { refresh_token: refreshToken },
    });
    return data;
}
