import { API_BASE_URL } from "@/lib/config";
import type {
  CustomerUser,
  LoginResponse,
  OtpRequestPayload,
  OtpRequestResponse,
  OtpVerifyPayload,
} from "@/types/auth";

const TOKEN_KEY = "customer_access_token";
const USER_KEY = "customer_user";

export function saveSession(login: LoginResponse): void {
  localStorage.setItem(TOKEN_KEY, login.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(login.user));
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): CustomerUser | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as CustomerUser;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function mapAuthError(status: number, fallback: string): Error {
  if (status === 400) {
    return new Error("اطلاعات وارد شده معتبر نیست");
  }
  if (status === 401) {
    return new Error("کد تأیید نامعتبر یا منقضی شده است");
  }
  if (status === 429) {
    return new Error("لطفاً کمی صبر کنید و دوباره تلاش کنید");
  }
  return new Error(fallback);
}

export async function requestOtp(
  payload: OtpRequestPayload,
): Promise<OtpRequestResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/otp/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw mapAuthError(
      response.status,
      "خطا در ارسال کد تأیید. دوباره تلاش کنید.",
    );
  }

  return (await response.json()) as OtpRequestResponse;
}

export async function verifyOtp(
  payload: OtpVerifyPayload,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw mapAuthError(
      response.status,
      "خطا در تأیید کد. دوباره تلاش کنید.",
    );
  }

  return (await response.json()) as LoginResponse;
}
