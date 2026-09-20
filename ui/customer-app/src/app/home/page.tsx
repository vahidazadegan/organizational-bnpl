import { Container, Stack, Typography } from "@mui/material";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "خانه | Customer App",
  description: "صفحه اصلی اپلیکیشن مشتری",
};

export default function HomePage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Stack spacing={1}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          خوش آمدید
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ورود با موفقیت انجام شد.
        </Typography>
      </Stack>
    </Container>
  );
}
