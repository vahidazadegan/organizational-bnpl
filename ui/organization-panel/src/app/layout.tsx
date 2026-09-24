import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppProviders } from "@/components/AppProviders";

/** Vazirmatn FD (Farsi Digits) — SIL OFL, rastikerdar/vazirmatn v33.003 */
const vazirmatn = localFont({
  src: [
    { path: "../fonts/Vazirmatn-FD-Thin.woff2", weight: "100", style: "normal" },
    {
      path: "../fonts/Vazirmatn-FD-ExtraLight.woff2",
      weight: "200",
      style: "normal",
    },
    { path: "../fonts/Vazirmatn-FD-Light.woff2", weight: "300", style: "normal" },
    {
      path: "../fonts/Vazirmatn-FD-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Vazirmatn-FD-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Vazirmatn-FD-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    { path: "../fonts/Vazirmatn-FD-Bold.woff2", weight: "700", style: "normal" },
    {
      path: "../fonts/Vazirmatn-FD-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
    { path: "../fonts/Vazirmatn-FD-Black.woff2", weight: "900", style: "normal" },
  ],
  display: "swap",
  variable: "--font-vazirmatn",
  adjustFontFallback: false,
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
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} ${vazirmatn.className}`}>
      <body className={vazirmatn.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
