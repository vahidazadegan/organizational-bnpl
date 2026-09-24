import type { Metadata } from "next";
import { DashboardHome } from "@/components/dashboard/DashboardHome";

export const metadata: Metadata = {
  title: "داشبورد | Admin Panel",
  description: "داشبورد پنل ادمین",
};

export default function DashboardPage() {
  return <DashboardHome />;
}
