import type { Metadata } from "next";
import { DashboardHome } from "@/components/dashboard/DashboardHome";

export const metadata: Metadata = {
  title: "داشبورد | Organization Panel",
  description: "داشبورد پنل سازمانی",
};

export default function DashboardPage() {
  return <DashboardHome />;
}
