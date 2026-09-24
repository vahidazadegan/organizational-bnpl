import { API_BASE_URL } from "@/lib/config";
import { getAccessToken } from "@/lib/auth/session";
import type {
  CreateMerchantRequest,
  MerchantAccessKeyResponse,
  MerchantCreatedResponse,
  MerchantItem,
  UpdateMerchantRequest,
  UpdateMerchantStatusRequest,
} from "@/types/merchant";

export class MerchantsApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "MerchantsApiError";
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
    throw new MerchantsApiError(
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

export async function listMerchants(): Promise<MerchantItem[]> {
  const token = requireToken();
  const response = await fetch(`${API_BASE_URL}/api/merchants`, {
    method: "GET",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new MerchantsApiError(
        "نشست کاربری منقضی شده است. دوباره وارد شوید.",
        401,
      );
    }
    throw new MerchantsApiError(
      await readErrorMessage(
        response,
        "خطا در دریافت فهرست پذیرندگان. دوباره تلاش کنید.",
      ),
      response.status,
    );
  }

  return (await response.json()) as MerchantItem[];
}

export async function createMerchant(
  body: CreateMerchantRequest,
): Promise<MerchantCreatedResponse> {
  const token = requireToken();
  const response = await fetch(`${API_BASE_URL}/api/merchants`, {
    method: "POST",
    headers: authHeaders(token, true),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new MerchantsApiError(
        "نشست کاربری منقضی شده است. دوباره وارد شوید.",
        401,
      );
    }
    throw new MerchantsApiError(
      await readErrorMessage(
        response,
        "خطا در ایجاد پذیرنده. دوباره تلاش کنید.",
      ),
      response.status,
    );
  }

  return (await response.json()) as MerchantCreatedResponse;
}

export async function updateMerchant(
  id: string,
  body: UpdateMerchantRequest,
): Promise<MerchantItem> {
  const token = requireToken();
  const response = await fetch(`${API_BASE_URL}/api/merchants/${id}`, {
    method: "PATCH",
    headers: authHeaders(token, true),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new MerchantsApiError(
        "نشست کاربری منقضی شده است. دوباره وارد شوید.",
        401,
      );
    }
    throw new MerchantsApiError(
      await readErrorMessage(
        response,
        "خطا در ویرایش پذیرنده. دوباره تلاش کنید.",
      ),
      response.status,
    );
  }

  return (await response.json()) as MerchantItem;
}

export async function updateMerchantStatus(
  id: string,
  body: UpdateMerchantStatusRequest,
): Promise<MerchantItem> {
  const token = requireToken();
  const response = await fetch(`${API_BASE_URL}/api/merchants/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(token, true),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new MerchantsApiError(
        "نشست کاربری منقضی شده است. دوباره وارد شوید.",
        401,
      );
    }
    throw new MerchantsApiError(
      await readErrorMessage(
        response,
        "خطا در تغییر وضعیت پذیرنده. دوباره تلاش کنید.",
      ),
      response.status,
    );
  }

  return (await response.json()) as MerchantItem;
}

export async function rotateMerchantAccessKey(
  id: string,
): Promise<MerchantAccessKeyResponse> {
  const token = requireToken();
  const response = await fetch(
    `${API_BASE_URL}/api/merchants/${id}/rotate-access-key`,
    {
      method: "POST",
      headers: authHeaders(token),
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new MerchantsApiError(
        "نشست کاربری منقضی شده است. دوباره وارد شوید.",
        401,
      );
    }
    throw new MerchantsApiError(
      await readErrorMessage(
        response,
        "خطا در چرخش کلید دسترسی. دوباره تلاش کنید.",
      ),
      response.status,
    );
  }

  return (await response.json()) as MerchantAccessKeyResponse;
}
