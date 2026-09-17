import { Box, Container } from "@mui/material";
import type { Metadata } from "next";
import { LoginForm } from "@/components/login/LoginForm";

export const metadata: Metadata = {
  title: "ورود | Organization Panel",
  description: "صفحه ورود نمایشی پنل سازمانی",
};

export default function LoginPage() {
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
        <LoginForm />
      </Container>
    </Box>
  );
}
