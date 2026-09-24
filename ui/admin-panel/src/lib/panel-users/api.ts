import { API_BASE_URL } from "@/lib/config";
import { getAccessToken } from "@/lib/auth/session";
import type {
  CreatePanelUserRequest,
  OrganizationSummary,
  PanelUserItem,
  PanelUserSearchParams,
  PanelUserSearchResponse,
  UpdatePanelUserStatusRequest,
} from "@/types/panel-user";

export class PanelUsersApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "PanelUsersApiError";
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
    throw new PanelUsersApiError("نشست کاربری معتبر نیست. دوباره وارد شوید.", 401);
  }
  return token;
}

function authHeaders(token: string, json = false): HeadersInit {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

export async function searchPanelUsers(
  params: PanelUserSearchParams,
): Promise<PanelUserSearchResponse> {
  const token = requireToken();

  const query = new URLSearchParams();
  if (params.username?.trim()) {
    query.set("username", params.username.trim());
  }
  if (params.name?.trim()) {
    query.set("name", params.name.trim());
  }
  if (params.status) {
    query.set("status", params.status);
  }
  if (params.organization?.trim()) {
    query.set("organization", params.organization.trim());
  }
  if (params.page != null) {
    query.set("page", String(params.page));
  }
  if (params.size != null) {
    query.set("size", String(params.size));
  }

  const qs = query.toString();
  const response = await fetch(
    `${API_BASE_URL}/api/panel-users${qs ? `?${qs}` : ""}`,
    {
      method: "GET",
      headers: authHeaders(token),
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new PanelUsersApiError(
        "نشست کاربری منقضی شده است. دوباره وارد شوید.",
        401,
      );
    }
    throw new PanelUsersApiError(
      await readErrorMessage(
        response,
        "خطا در دریافت فهرست کاربران سازمانی. دوباره تلاش کنید.",
      ),
      response.status,
    );
  }

  return (await response.json()) as PanelUserSearchResponse;
}

export async function listOrganizations(): Promise<OrganizationSummary[]> {
  const token = requireToken();
  const response = await fetch(`${API_BASE_URL}/api/organizations`, {
    method: "GET",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new PanelUsersApiError(
        "نشست کاربری منقضی شده است. دوباره وارد شوید.",
        401,
      );
    }
    throw new PanelUsersApiError(
      await readErrorMessage(
        response,
        "خطا در دریافت فهرست سازمان‌ها. دوباره تلاش کنید.",
      ),
      response.status,
    );
  }

  return (await response.json()) as OrganizationSummary[];
}

export async function createPanelUser(
  body: CreatePanelUserRequest,
): Promise<PanelUserItem> {
  const token = requireToken();
  const response = await fetch(`${API_BASE_URL}/api/panel-users`, {
    method: "POST",
    headers: authHeaders(token, true),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new PanelUsersApiError(
        "نشست کاربری منقضی شده است. دوباره وارد شوید.",
        401,
      );
    }
    throw new PanelUsersApiError(
      await readErrorMessage(
        response,
        "خطا در ایجاد کاربر سازمانی. دوباره تلاش کنید.",
      ),
      response.status,
    );
  }

  return (await response.json()) as PanelUserItem;
}

export async function updatePanelUserStatus(
  id: string,
  body: UpdatePanelUserStatusRequest,
): Promise<PanelUserItem> {
  const token = requireToken();
  const response = await fetch(`${API_BASE_URL}/api/panel-users/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(token, true),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new PanelUsersApiError(
        "نشست کاربری منقضی شده است. دوباره وارد شوید.",
        401,
      );
    }
    throw new PanelUsersApiError(
      await readErrorMessage(
        response,
        "خطا در تغییر وضعیت کاربر. دوباره تلاش کنید.",
      ),
      response.status,
    );
  }

  return (await response.json()) as PanelUserItem;
}
