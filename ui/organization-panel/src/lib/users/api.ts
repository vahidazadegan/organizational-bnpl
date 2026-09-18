import { API_BASE_URL } from "@/lib/config";
import { getAccessToken } from "@/lib/auth/session";
import type {
  UserImportResponse,
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

export async function searchUsers(
  params: UserSearchParams,
): Promise<UserSearchResponse> {
  const token = getAccessToken();
  if (!token) {
    throw new UsersApiError("نشست کاربری معتبر نیست. دوباره وارد شوید.", 401);
  }

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

    let message = "خطا در دریافت فهرست کاربران. دوباره تلاش کنید.";
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) {
        message = body.message;
      }
    } catch {
      // keep default message
    }
    throw new UsersApiError(message, response.status);
  }

  return (await response.json()) as UserSearchResponse;
}

export async function importUsers(file: File): Promise<UserImportResponse> {
  const token = getAccessToken();
  if (!token) {
    throw new UsersApiError("نشست کاربری معتبر نیست. دوباره وارد شوید.", 401);
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/users/import`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new UsersApiError("نشست کاربری منقضی شده است. دوباره وارد شوید.", 401);
    }

    let message = "خطا در بارگذاری فایل کاربران. دوباره تلاش کنید.";
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) {
        message = body.message;
      }
    } catch {
      // keep default message
    }
    throw new UsersApiError(message, response.status);
  }

  return (await response.json()) as UserImportResponse;
}
