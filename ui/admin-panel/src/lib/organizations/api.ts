import { API_BASE_URL } from "@/lib/config";
import { getAccessToken } from "@/lib/auth/session";
import type {
  CreateOrganizationRequest,
  OrganizationItem,
  UpdateOrganizationStatusRequest,
} from "@/types/organization";

export class OrganizationsApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "OrganizationsApiError";
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
    throw new OrganizationsApiError(
      "نشست کاربری معتبر نیست. دوباره وارد شوید.",
      401,
    );
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

export async function listOrganizations(): Promise<OrganizationItem[]> {
  const token = requireToken();
  const response = await fetch(`${API_BASE_URL}/api/organizations`, {
    method: "GET",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new OrganizationsApiError(
        "نشست کاربری منقضی شده است. دوباره وارد شوید.",
        401,
      );
    }
    throw new OrganizationsApiError(
      await readErrorMessage(
        response,
        "خطا در دریافت فهرست سازمان‌ها. دوباره تلاش کنید.",
      ),
      response.status,
    );
  }

  return (await response.json()) as OrganizationItem[];
}

export async function createOrganization(
  body: CreateOrganizationRequest,
): Promise<OrganizationItem> {
  const token = requireToken();
  const response = await fetch(`${API_BASE_URL}/api/organizations`, {
    method: "POST",
    headers: authHeaders(token, true),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new OrganizationsApiError(
        "نشست کاربری منقضی شده است. دوباره وارد شوید.",
        401,
      );
    }
    throw new OrganizationsApiError(
      await readErrorMessage(
        response,
        "خطا در ایجاد سازمان. دوباره تلاش کنید.",
      ),
      response.status,
    );
  }

  return (await response.json()) as OrganizationItem;
}

export async function updateOrganizationStatus(
  id: string,
  body: UpdateOrganizationStatusRequest,
): Promise<OrganizationItem> {
  const token = requireToken();
  const response = await fetch(`${API_BASE_URL}/api/organizations/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(token, true),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new OrganizationsApiError(
        "نشست کاربری منقضی شده است. دوباره وارد شوید.",
        401,
      );
    }
    throw new OrganizationsApiError(
      await readErrorMessage(
        response,
        "خطا در تغییر وضعیت سازمان. دوباره تلاش کنید.",
      ),
      response.status,
    );
  }

  return (await response.json()) as OrganizationItem;
}
