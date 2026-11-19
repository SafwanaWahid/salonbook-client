const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function apiFetch<T = Record<string, unknown>>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    credentials: "include",
    headers: { ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong. Please try again.");
  return data as T;
}

export async function ensureAccessToken() {
  return apiFetch<{ user: { id: string; name: string; email: string; role: string } }>("/token", { method: "POST" });
}
