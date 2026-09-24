import type { Metadata } from "next";
import { HomeLanding } from "@/components/home/HomeLanding";

export const metadata: Metadata = {
  title: "خانه",
  description: "داشبورد مشتری — اعتبار و اقساط",
};

export default function HomePage() {
  return <HomeLanding />;
}
