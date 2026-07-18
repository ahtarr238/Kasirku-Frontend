// ── Token key ───────────────────────────────────────────────
const TOKEN_KEY = 'kasirku_token';

// ── Token management ────────────────────────────────────────
export const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
  // Simpan juga ke cookie untuk Next.js middleware (edge runtime)
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
};

export const isLoggedIn = (): boolean => !!getToken();

// ── Decode JWT payload (tanpa verify — verifikasi ada di backend) ──
export interface TokenPayload {
  id: string;
  email: string;
  name?: string;
}

export const getUser = (): TokenPayload | null => {
  const token = getToken();
  if (!token) return null;
  try {
    const base64 = token.split('.')[1];
    const payload = JSON.parse(atob(base64));
    return { id: payload.id, email: payload.email };
  } catch {
    return null;
  }
};
