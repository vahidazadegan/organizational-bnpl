import { Box } from "@mui/material";
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
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        px: 2.5,
        py: 4,
      }}
    >
      <LoginForm />
    </Box>
  );
}
