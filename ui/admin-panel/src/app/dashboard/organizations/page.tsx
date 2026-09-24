import type { Metadata } from "next";
import { OrganizationsPage } from "@/components/dashboard/OrganizationsPage";

export const metadata: Metadata = {
  title: "سازمان‌ها | Admin Panel",
  description: "مدیریت سازمان‌ها",
};

export default function OrganizationsRoutePage() {
  return <OrganizationsPage />;
}
