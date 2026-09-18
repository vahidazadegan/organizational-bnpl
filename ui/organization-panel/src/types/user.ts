export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type UserStatus = "ACTIVE" | "INACTIVE";

export type UserSearchParams = {
  name?: string;
  mobile?: string;
  nationalId?: string;
  status?: UserStatus | "";
  page?: number;
  size?: number;
};

export type UserItem = {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  nationalId: string;
  birthDate: string | null;
  status: string;
};

export type UserSearchResponse = PageResponse<UserItem>;

export type UserImportRowError = {
  rowNumber: number;
  message: string;
};

export type UserImportResponse = {
  totalRows: number;
  imported: number;
  skipped: number;
  errors: UserImportRowError[];
};
