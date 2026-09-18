"use client";

import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import {
  Avatar,
  Box,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredUser } from "@/lib/auth/session";
import type { PanelUser } from "@/types/auth";

function displayName(user: PanelUser): string {
  return `${user.firstName} ${user.lastName}`.trim() || user.username;
}

function initials(user: PanelUser): string {
  const first = user.firstName?.trim().charAt(0) ?? "";
  const last = user.lastName?.trim().charAt(0) ?? "";
  const value = `${first}${last}` || user.username.charAt(0);
  return value.toUpperCase();
}

export function DashboardHeader() {
  const router = useRouter();
  const [user, setUser] = useState<PanelUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      router.replace("/login");
      return;
    }
    setUser(stored);
    setReady(true);
  }, [router]);

  return (
    <Box
      component="header"
      sx={{
        bgcolor: "common.white",
        borderBottom: "1px solid",
        borderColor: "divider",
        px: { xs: 2, sm: 3 },
        py: 1.75,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        <Typography
          variant="subtitle1"
          fontWeight={600}
          color="text.primary"
          sx={{ display: { xs: "none", sm: "block" } }}
        >
          داشبورد
        </Typography>

        {!ready || !user ? (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width={96} height={20} />
          </Stack>
        ) : (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: "#3C50E0",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {initials(user) || <PersonOutlineIcon fontSize="small" />}
            </Avatar>
            <Typography
              variant="body2"
              fontWeight={600}
              color="text.primary"
              noWrap
            >
              {displayName(user)}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
