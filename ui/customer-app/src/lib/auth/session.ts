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

const NETWORK_ERROR_MESSAGE =
  "خطا در برقراری ارتباط با سرور. دوباره تلاش کنید.";

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

function toUserFacingError(error: unknown, fallback: string): Error {
  if (error instanceof TypeError) {
    return new Error(NETWORK_ERROR_MESSAGE);
  }
  if (error instanceof Error) {
    return error;
  }
  return new Error(fallback);
}

export async function requestOtp(
  payload: OtpRequestPayload,
): Promise<OtpRequestResponse> {
  try {
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
  } catch (error) {
    throw toUserFacingError(error, "خطا در ارسال کد تأیید. دوباره تلاش کنید.");
  }
}

export async function verifyOtp(
  payload: OtpVerifyPayload,
): Promise<LoginResponse> {
  try {
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
  } catch (error) {
    throw toUserFacingError(error, "خطا در تأیید کد. دوباره تلاش کنید.");
  }
}
