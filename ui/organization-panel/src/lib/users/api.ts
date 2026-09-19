import { API_BASE_URL } from "@/lib/config";
import { getAccessToken } from "@/lib/auth/session";
import type {
  UserCreditItem,
  UserSearchParams,
  UserSearchResponse,
} from "@/types/user";

export class UsersApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "UsersApiError";
    this.status = status;
  }
}

async function readErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string };
    if (body.message) {
      return body.message;
    }
  } catch {
    // keep fallback
  }
  return fallback;
}

function requireToken(): string {
  const token = getAccessToken();
  if (!token) {
    throw new UsersApiError("نشست کاربری معتبر نیست. دوباره وارد شوید.", 401);
  }
  return token;
}

export async function searchUsers(
  params: UserSearchParams,
): Promise<UserSearchResponse> {
  const token = requireToken();

  const query = new URLSearchParams();
  if (params.name?.trim()) {
    query.set("name", params.name.trim());
  }
  if (params.mobile?.trim()) {
    query.set("mobile", params.mobile.trim());
  }
  if (params.nationalId?.trim()) {
    query.set("nationalId", params.nationalId.trim());
  }
  if (params.status) {
    query.set("status", params.status);
  }
  if (params.page != null) {
    query.set("page", String(params.page));
  }
  if (params.size != null) {
    query.set("size", String(params.size));
  }

  const qs = query.toString();
  const response = await fetch(
    `${API_BASE_URL}/api/users${qs ? `?${qs}` : ""}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new UsersApiError("نشست کاربری منقضی شده است. دوباره وارد شوید.", 401);
    }
    throw new UsersApiError(
      await readErrorMessage(response, "خطا در دریافت فهرست کاربران. دوباره تلاش کنید."),
      response.status,
    );
  }

  return (await response.json()) as UserSearchResponse;
}

export async function fetchUserCredits(userId: string): Promise<UserCreditItem[]> {
  const token = requireToken();

  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/credits`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new UsersApiError("نشست کاربری منقضی شده است. دوباره وارد شوید.", 401);
    }
    throw new UsersApiError(
      await readErrorMessage(response, "خطا در دریافت اعتبارات کاربر. دوباره تلاش کنید."),
      response.status,
    );
  }

  return (await response.json()) as UserCreditItem[];
}
