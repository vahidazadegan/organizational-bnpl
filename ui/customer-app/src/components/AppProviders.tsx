"use client";

import * as React from "react";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import { CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import { MobileShell } from "@/components/layout/MobileShell";
import { theme } from "@/theme";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider
      options={{
        key: "muirtl",
        stylisPlugins: [prefixer, rtlPlugin],
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MobileShell>{children}</MobileShell>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
