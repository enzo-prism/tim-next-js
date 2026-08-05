export type FetchJsonError = Error & {
  status?: number;
  payload?: unknown;
};

const getPayloadMessage = (value: unknown): string | null => {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  return typeof v.message === "string" ? v.message : null;
};

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const error: FetchJsonError = new Error(getPayloadMessage(payload) || res.statusText);
    error.status = res.status;
    error.payload = payload;
    throw error;
  }
  return payload as T;
}

export async function patchJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const error: FetchJsonError = new Error(getPayloadMessage(payload) || res.statusText);
    error.status = res.status;
    error.payload = payload;
    throw error;
  }
  return payload as T;
}
