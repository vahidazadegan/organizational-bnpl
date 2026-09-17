"use client";

import CelebrationOutlinedIcon from "@mui/icons-material/CelebrationOutlined";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, getStoredUser } from "@/lib/auth/session";

export function WelcomeMessage() {
  const router = useRouter();
  const [user] = useState(() => getStoredUser());

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: "40vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const displayName = `${user.firstName} ${user.lastName}`.trim() || user.username;

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 520,
        p: { xs: 3, sm: 5 },
        borderRadius: "20px",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 18px 50px rgba(26, 11, 46, 0.12)",
        textAlign: "center",
      }}
    >
      <Stack spacing={2.5} alignItems="center">
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            display: "grid",
            placeItems: "center",
          }}
        >
          <CelebrationOutlinedIcon fontSize="large" />
        </Box>
        <Typography variant="h4" component="h1" fontWeight={700}>
          ورود شما را تبریک می‌گوییم
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {displayName} عزیز، با موفقیت وارد پنل سازمانی شدید.
        </Typography>
        <Button
          variant="outlined"
          onClick={() => {
            clearSession();
            router.push("/login");
          }}
        >
          خروج
        </Button>
      </Stack>
    </Paper>
  );
}
