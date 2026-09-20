import type { PageResponse } from "@/types/user";

export type PurchaseStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type PurchaseSearchParams = {
  name?: string;
  mobile?: string;
  nationalId?: string;
  status?: PurchaseStatus | "";
  orderNumber?: string;
  shopName?: string;
  page?: number;
  size?: number;
};

export type PurchaseItem = {
  id: string;
  userId: string;
  userFirstName: string;
  userLastName: string;
  userNationalId: string;
  userMobile: string;
  organizationId: string;
  userCreditId: string;
  merchantId: string | null;
  shopName: string | null;
  description: string | null;
  amount: number;
  currency: string;
  annualInterestRate: number;
  repaymentMonths: number;
  status: PurchaseStatus;
  orderNumber: string | null;
  externalReference: string | null;
  purchasedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseSearchResponse = PageResponse<PurchaseItem>;

export type InstallmentStatus =
  | "PENDING"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export type InstallmentItem = {
  id: string;
  installmentNumber: number;
  amount: number;
  paidAmount: number;
  dueDate: string;
  paidAt: string | null;
  status: InstallmentStatus;
  createdAt: string;
  updatedAt: string;
};

export type InstallmentSearchResponse = PageResponse<InstallmentItem>;
