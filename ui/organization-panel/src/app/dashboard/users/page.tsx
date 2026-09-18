import type { Metadata } from "next";
import { UsersPage } from "@/components/dashboard/UsersPage";

export const metadata: Metadata = {
  title: "کاربران | Organization Panel",
  description: "جست‌وجو و مدیریت کاربران سازمان",
};

export default function DashboardUsersRoute() {
  return <UsersPage />;
}
