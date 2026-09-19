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

export type UserCreditItem = {
  id: string;
  userId: string;
  organizationId: string;
  creditLimit: number;
  usedCredit: number;
  annualInterestRate: number;
  repaymentMonths: number;
  currency: string;
  status: string;
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
};
