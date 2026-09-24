export type CreditSummary = {
  remainingAmount: number;
  totalLimit: number;
  usedAmount: number;
  currency: string;
};

export type HomeInstallmentStatus = "PENDING" | "OVERDUE" | "PAID" | "PARTIALLY_PAID";

export type HomeInstallment = {
  id: string;
  shopName: string;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  dueDate: string;
  status: HomeInstallmentStatus;
};

export type HomePurchase = {
  id: string;
  shopName: string;
  amount: number;
  purchasedAt: string;
};

export type HomeDashboard = {
  credit: CreditSummary;
  nextDueAmount: number;
  nextDueDate: string | null;
  installments: HomeInstallment[];
  recentPurchases: HomePurchase[];
};
