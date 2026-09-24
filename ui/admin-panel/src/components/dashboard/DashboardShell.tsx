import { Box } from "@mui/material";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";

const CONTENT_BG = "#F1F5F9";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: CONTENT_BG,
        flexDirection: "row",
      }}
    >
      <DashboardSidebar />
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          bgcolor: CONTENT_BG,
          backgroundImage: "none",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <DashboardHeader />
        <Box sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
