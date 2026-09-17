import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { AppProviders } from "@/components/AppProviders";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: "Organization Panel",
  description: "Organizational BNPL panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className={vazirmatn.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
