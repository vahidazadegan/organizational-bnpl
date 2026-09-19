import { API_BASE_URL } from "@/lib/config";
import { getAccessToken } from "@/lib/auth/session";
import type {
  DataEntryFileStatus,
  DataEntryFileType,
  DataEntrySearchParams,
  DataEntrySearchResponse,
  DataEntryUploadResponse,
} from "@/types/data-entry";

export const FILE_TYPE_LABEL: Record<DataEntryFileType, string> = {
  USERS: "کاربران",
  CREDIT_ALLOCATION: "تخصیص اعتبار",
};

export type DataEntryColumnSpec = {
  name: string;
  dataType: string;
  required: boolean;
  description: string;
};

export const FILE_TYPE_COLUMNS: Record<DataEntryFileType, DataEntryColumnSpec[]> = {
  USERS: [
    {
      name: "first_name",
      dataType: "متن",
      required: true,
      description: "نام",
    },
    {
      name: "last_name",
      dataType: "متن",
      required: true,
      description: "نام خانوادگی",
    },
    {
      name: "mobile",
      dataType: "متن عددی",
      required: true,
      description: "شماره موبایل",
    },
    {
      name: "national_id",
      dataType: "متن عددی",
      required: true,
      description: "کد ملی",
    },
    {
      name: "birth_date",
      dataType: "تاریخ شمسی (yyyyMMdd)",
      required: false,
      description: "تاریخ تولد",
    },
    {
      name: "status",
      dataType: "متن (ACTIVE|INACTIVE)",
      required: false,
      description: "وضعیت؛ پیش‌فرض ACTIVE",
    },
  ],
  CREDIT_ALLOCATION: [
    {
      name: "national_id",
      dataType: "متن عددی",
      required: true,
      description: "کد ملی کاربر",
    },
    {
      name: "credit_limit",
      dataType: "عدد صحیح (ریال)",
      required: true,
      description: "سقف اعتبار",
    },
    {
      name: "annual_interest_rate",
      dataType: "عدد اعشاری",
      required: true,
      description: "نرخ سود سالانه (مثلاً 23.5000)",
    },
    {
      name: "repayment_months",
      dataType: "عدد صحیح",
      required: true,
      description: "تعداد ماه بازپرداخت",
    },
    {
      name: "allocation_token",
      dataType: "متن (حداکثر ۵۰۰۰)",
      required: true,
      description: "توکن/امضای تخصیص",
    },
    {
      name: "valid_from",
      dataType: "تاریخ شمسی (yyyyMMdd)",
      required: false,
      description: "شروع اعتبار",
    },
    {
      name: "valid_until",
      dataType: "تاریخ شمسی (yyyyMMdd)",
      required: false,
      description: "پایان اعتبار",
    },
    {
      name: "status",
      dataType: "متن (ACTIVE|INACTIVE)",
      required: false,
      description: "وضعیت؛ پیش‌فرض ACTIVE",
    },
    {
      name: "currency",
      dataType: "متن (مثلاً IRR)",
      required: false,
      description: "واحد پول؛ پیش‌فرض IRR",
    },
  ],
};

export const STATUS_LABEL: Record<DataEntryFileStatus, string> = {
  PENDING: "در انتظار",
  PROCESSING: "در حال پردازش",
  COMPLETED: "انجام‌شده",
  FAILED: "ناموفق",
};

export class DataEntryApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "DataEntryApiError";
    this.status = status;
  }
}

function requireToken(): string {
  const token = getAccessToken();
  if (!token) {
    throw new DataEntryApiError("نشست کاربری معتبر نیست. دوباره وارد شوید.", 401);
  }
  return token;
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

export async function searchDataEntryFiles(
  params: DataEntrySearchParams,
): Promise<DataEntrySearchResponse> {
  const token = requireToken();

  const query = new URLSearchParams();
  if (params.fileName?.trim()) {
    query.set("fileName", params.fileName.trim());
  }
  if (params.fileType) {
    query.set("fileType", params.fileType);
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
    `${API_BASE_URL}/api/data-entry/files${qs ? `?${qs}` : ""}`,
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
      throw new DataEntryApiError("نشست کاربری منقضی شده است. دوباره وارد شوید.", 401);
    }
    throw new DataEntryApiError(
      await readErrorMessage(response, "خطا در دریافت فهرست فایل‌ها. دوباره تلاش کنید."),
      response.status,
    );
  }

  return (await response.json()) as DataEntrySearchResponse;
}

export async function uploadDataEntryFile(
  file: File,
  fileType: DataEntryFileType,
): Promise<DataEntryUploadResponse> {
  const token = requireToken();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileType", fileType);

  const response = await fetch(`${API_BASE_URL}/api/data-entry/files`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new DataEntryApiError("نشست کاربری منقضی شده است. دوباره وارد شوید.", 401);
    }
    throw new DataEntryApiError(
      await readErrorMessage(response, "خطا در بارگذاری فایل. دوباره تلاش کنید."),
      response.status,
    );
  }

  return (await response.json()) as DataEntryUploadResponse;
}

export async function downloadDataEntryResult(fileId: string): Promise<Blob> {
  const token = requireToken();

  const response = await fetch(
    `${API_BASE_URL}/api/data-entry/files/${fileId}/result`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new DataEntryApiError("نشست کاربری منقضی شده است. دوباره وارد شوید.", 401);
    }
    throw new DataEntryApiError(
      await readErrorMessage(response, "دانلود نتیجه ناموفق بود."),
      response.status,
    );
  }

  return response.blob();
}
