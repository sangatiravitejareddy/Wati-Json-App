/**
 * API client — typed fetch wrapper with auth token injection.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function request(
    method: string,
    path: string,
    body?: unknown,
    token?: string | null
) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(error.detail || `HTTP ${res.status}`);
    }

    return res.json();
}

export const api = {
    get: (path: string, token?: string | null) => request("GET", path, undefined, token),
    post: (path: string, body?: unknown, token?: string | null) =>
        request("POST", path, body, token),
    del: (path: string, token?: string | null) => request("DELETE", path, undefined, token),
};
