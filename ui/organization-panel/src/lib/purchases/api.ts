import { API_BASE_URL } from "@/lib/config";
import { getAccessToken } from "@/lib/auth/session";
import type {
  InstallmentSearchResponse,
  PurchaseSearchParams,
  PurchaseSearchResponse,
} from "@/types/purchase";

export class PurchasesApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "PurchasesApiError";
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
    throw new PurchasesApiError("نشست کاربری معتبر نیست. دوباره وارد شوید.", 401);
  }
  return token;
}

export async function searchPurchases(
  params: PurchaseSearchParams,
): Promise<PurchaseSearchResponse> {
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
  if (params.orderNumber?.trim()) {
    query.set("orderNumber", params.orderNumber.trim());
  }
  if (params.shopName?.trim()) {
    query.set("shopName", params.shopName.trim());
  }
  if (params.page != null) {
    query.set("page", String(params.page));
  }
  if (params.size != null) {
    query.set("size", String(params.size));
  }

  const qs = query.toString();
  const response = await fetch(
    `${API_BASE_URL}/api/purchases${qs ? `?${qs}` : ""}`,
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
      throw new PurchasesApiError(
        "نشست کاربری منقضی شده است. دوباره وارد شوید.",
        401,
      );
    }
    throw new PurchasesApiError(
      await readErrorMessage(
        response,
        "خطا در دریافت فهرست خریدها. دوباره تلاش کنید.",
      ),
      response.status,
    );
  }

  return (await response.json()) as PurchaseSearchResponse;
}

export async function fetchPurchaseInstallments(
  purchaseId: string,
  params: { page?: number; size?: number } = {},
): Promise<InstallmentSearchResponse> {
  const token = requireToken();

  const query = new URLSearchParams();
  if (params.page != null) {
    query.set("page", String(params.page));
  }
  if (params.size != null) {
    query.set("size", String(params.size));
  }

  const qs = query.toString();
  const response = await fetch(
    `${API_BASE_URL}/api/purchases/${purchaseId}/installments${qs ? `?${qs}` : ""}`,
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
      throw new PurchasesApiError(
        "نشست کاربری منقضی شده است. دوباره وارد شوید.",
        401,
      );
    }
    throw new PurchasesApiError(
      await readErrorMessage(
        response,
        "خطا در دریافت اقساط خرید. دوباره تلاش کنید.",
      ),
      response.status,
    );
  }

  return (await response.json()) as InstallmentSearchResponse;
}
