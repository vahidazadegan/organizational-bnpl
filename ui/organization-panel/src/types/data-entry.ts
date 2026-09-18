export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

/** Phase 1: only USERS is supported by the backend. */
export type DataEntryFileType = "USERS";

export type DataEntryFileStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type DataEntryFileItem = {
  id: string;
  fileName: string;
  fileType: DataEntryFileType;
  status: DataEntryFileStatus;
  uploadedAt: string;
  uploadedBy: string;
  totalRows: number | null;
  successRows: number | null;
  failedRows: number | null;
  hasResultFile: boolean;
};

export type DataEntrySearchParams = {
  fileName?: string;
  fileType?: DataEntryFileType | "";
  status?: DataEntryFileStatus | "";
  page?: number;
  size?: number;
};

export type DataEntrySearchResponse = PageResponse<DataEntryFileItem>;

export type DataEntryUploadResponse = {
  id: string;
  fileName: string;
  fileType: DataEntryFileType;
  status: DataEntryFileStatus;
};
