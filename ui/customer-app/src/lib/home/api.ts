import type { HomeDashboard } from "@/types/home";

/** Placeholder until customer-service home APIs exist. */
export async function fetchHomeDashboard(): Promise<HomeDashboard> {
  await new Promise((resolve) => setTimeout(resolve, 350));

  return {
    credit: {
      remainingAmount: 18_500_000,
      totalLimit: 50_000_000,
      usedAmount: 31_500_000,
      currency: "IRR",
    },
    nextDueAmount: 4_200_000,
    nextDueDate: "2026-10-05",
    installments: [
      {
        id: "1",
        shopName: "فروشگاه دیجی‌کالا",
        installmentNumber: 2,
        totalInstallments: 6,
        amount: 4_200_000,
        dueDate: "2026-10-05",
        status: "PENDING",
      },
      {
        id: "2",
        shopName: "هایپرمی",
        installmentNumber: 1,
        totalInstallments: 3,
        amount: 2_750_000,
        dueDate: "2026-10-12",
        status: "PENDING",
      },
      {
        id: "3",
        shopName: "بانی مد",
        installmentNumber: 3,
        totalInstallments: 4,
        amount: 1_900_000,
        dueDate: "2026-09-18",
        status: "OVERDUE",
      },
    ],
    recentPurchases: [
      {
        id: "p1",
        shopName: "فروشگاه دیجی‌کالا",
        amount: 12_600_000,
        purchasedAt: "2026-09-01",
      },
      {
        id: "p2",
        shopName: "هایپرمی",
        amount: 8_250_000,
        purchasedAt: "2026-08-22",
      },
    ],
  };
}
