import type { Metadata } from "next";
import { MerchantsPage } from "@/components/dashboard/MerchantsPage";

export const metadata: Metadata = {
  title: "پذیرندگان | Admin Panel",
  description: "مدیریت پذیرندگان",
};

export default function MerchantsRoutePage() {
  return <MerchantsPage />;
}
