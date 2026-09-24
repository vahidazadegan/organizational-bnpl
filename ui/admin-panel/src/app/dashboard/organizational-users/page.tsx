import type { Metadata } from "next";
import { OrganizationalUsersPage } from "@/components/dashboard/OrganizationalUsersPage";

export const metadata: Metadata = {
  title: "کاربران سازمانی | Admin Panel",
  description: "فهرست کاربران پنل سازمانی",
};

export default function OrganizationalUsersRoutePage() {
  return <OrganizationalUsersPage />;
}
