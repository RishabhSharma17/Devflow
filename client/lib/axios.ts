import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor — attach auth token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("access_token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status, data } = error.response;
            const message =
                data?.detail || data?.error || "An unexpected error occurred";

            if (status === 401) {
                // Token expired or invalid
                if (typeof window !== "undefined") {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    window.location.href = "/login";
                }
                toast.error("Session expired. Please log in again.");
            } else if (status === 403) {
                toast.error(`Permission denied: ${message}`);
            } else if (status === 404) {
                toast.error(`Not found: ${message}`);
            } else if (status === 409) {
                toast.error(message);
            } else if (status === 422) {
                toast.error("Validation error. Please check your input.");
            } else {
                toast.error(message);
            }
        } else if (error.request) {
            toast.error("Network error. Please check your connection.");
        }
        return Promise.reject(error);
    }
);

export default api;
