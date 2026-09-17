import { Box, Container } from "@mui/material";
import type { Metadata } from "next";
import { WelcomeMessage } from "@/components/welcome/WelcomeMessage";

export const metadata: Metadata = {
  title: "خوش آمدید | Organization Panel",
  description: "صفحه خوش‌آمدگویی پس از ورود",
};

export default function WelcomePage() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="sm" sx={{ py: 6, display: "flex", justifyContent: "center" }}>
        <WelcomeMessage />
      </Container>
    </Box>
  );
}
