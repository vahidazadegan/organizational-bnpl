import { API_BASE_URL } from "@/lib/config";
import type { LoginRequest, LoginResponse, PanelUser } from "@/types/auth";

const TOKEN_KEY = "panel_access_token";
const USER_KEY = "panel_user";

let cachedUser: PanelUser | null | undefined;
const listeners = new Set<() => void>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

function readUserFromStorage(): PanelUser | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as PanelUser;
  } catch {
    return null;
  }
}

export function subscribeSession(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function saveSession(login: LoginResponse): void {
  localStorage.setItem(TOKEN_KEY, login.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(login.user));
  cachedUser = login.user;
  notifyListeners();
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): PanelUser | null {
  if (typeof window === "undefined") {
    return null;
  }
  if (cachedUser === undefined) {
    cachedUser = readUserFromStorage();
  }
  return cachedUser;
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  cachedUser = null;
  notifyListeners();
}

export async function loginRequest(
  payload: LoginRequest,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("نام کاربری یا رمز ورود اشتباه وارد شده است");
    }
    throw new Error("خطا در برقراری ارتباط با سرور. دوباره تلاش کنید.");
  }

  return (await response.json()) as LoginResponse;
}
