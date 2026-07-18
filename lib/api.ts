import { getToken } from './auth';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

// ── Generic fetch wrapper ───────────────────────────────────
export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401 && !path.includes('/auth/')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('kasirku_token');
        window.location.href = '/login';
      }
    }
    throw new Error(data.error ?? 'Terjadi kesalahan');
  }

  return data as T;
}

// ── Typed shorthand helpers ─────────────────────────────────
export const apiGet = <T>(path: string) =>
  api<T>(path, { method: 'GET' });

export const apiPost = <T>(path: string, body: unknown) =>
  api<T>(path, { method: 'POST', body: JSON.stringify(body) });

export const apiPatch = <T>(path: string, body: unknown) =>
  api<T>(path, { method: 'PATCH', body: JSON.stringify(body) });

export const apiDelete = <T>(path: string) =>
  api<T>(path, { method: 'DELETE' });
