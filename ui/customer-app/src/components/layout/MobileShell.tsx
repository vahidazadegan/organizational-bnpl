"use client";

import { Box } from "@mui/material";

/**
 * Full-width mobile-first shell: same layout on phone and desktop.
 */
export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {children}
    </Box>
  );
}
