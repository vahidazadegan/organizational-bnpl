import type { Metadata } from "next";
import { PurchasesPage } from "@/components/dashboard/PurchasesPage";

export const metadata: Metadata = {
  title: "خریدها | Organization Panel",
  description: "فهرست خریدهای اعتباری سازمان",
};

export default function DashboardPurchasesRoute() {
  return <PurchasesPage />;
}
