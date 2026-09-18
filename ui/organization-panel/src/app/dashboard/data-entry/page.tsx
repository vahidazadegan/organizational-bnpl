import type { Metadata } from "next";
import { DataEntryPage } from "@/components/dashboard/DataEntryPage";

export const metadata: Metadata = {
  title: "ورود اطلاعات | Organization Panel",
  description: "آپلود و پیگیری فایل‌های CSV ورود اطلاعات",
};

export default function DataEntryRoute() {
  return <DataEntryPage />;
}
