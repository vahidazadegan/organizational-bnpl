import { Box, Container } from "@mui/material";
import type { Metadata } from "next";
import { LoginForm } from "@/components/login/LoginForm";

export const metadata: Metadata = {
  title: "ورود | Customer App",
  description: "ورود با کد یکبارمصرف موبایل",
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
