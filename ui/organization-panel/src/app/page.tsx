import { Box, Button, Container, Stack, Typography } from "@mui/material";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organization Panel",
  description: "Organizational BNPL panel",
};

export default function HomePage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Organization Panel
          </Typography>
          <Typography variant="body1" color="text.secondary">
            پنل سازمانی BNPL — برای ادامه وارد شوید.
          </Typography>
        </Box>
        <Button variant="contained" href="/login" sx={{ alignSelf: "flex-start" }}>
          ورود به پنل
        </Button>
      </Stack>
    </Container>
  );
}
