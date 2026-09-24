import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { AppProviders } from "@/components/AppProviders";

/** Self-hosted Vazirmatn (SIL OFL) from rastikerdar/vazirmatn v33.003 — Google Fonts is unreachable in this environment. */
const vazirmatn = localFont({
  src: "../fonts/Vazirmatn-Variable.woff2",
  display: "swap",
  variable: "--font-vazirmatn",
  weight: "100 900",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: {
    default: "Customer App",
    template: "%s | Customer App",
  },
  description: "Organizational BNPL customer app",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#F8FAFC",
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
