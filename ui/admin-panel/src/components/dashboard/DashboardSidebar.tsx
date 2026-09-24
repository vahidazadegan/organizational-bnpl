"use client";

import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth/session";

const SIDEBAR_BG = "#1C2434";
const SIDEBAR_WIDTH = 280;

type MenuItem = {
  label: string;
  icon: SvgIconComponent;
  href?: string;
};

const menuItems: MenuItem[] = [
  { label: "داشبورد", icon: DashboardOutlinedIcon, href: "/dashboard" },
  {
    label: "سازمان‌ها",
    icon: BusinessOutlinedIcon,
    href: "/dashboard/organizations",
  },
  {
    label: "کاربران سازمانی",
    icon: GroupsOutlinedIcon,
    href: "/dashboard/organizational-users",
  },
  {
    label: "پذیرندگان",
    icon: StorefrontOutlinedIcon,
    href: "/dashboard/merchants",
  },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <Box
      component="aside"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        minHeight: "100vh",
        bgcolor: SIDEBAR_BG,
        color: "common.white",
        px: 2,
        py: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 4, px: 1 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            bgcolor: "#3C50E0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 20, color: "common.white" }} />
        </Box>
        <Typography variant="h6" fontWeight={700} letterSpacing={0.2}>
          پنل ادمین
        </Typography>
      </Stack>

      <Box>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            px: 1.5,
            mb: 1,
            color: "rgba(255,255,255,0.45)",
            fontWeight: 600,
            letterSpacing: 0.8,
          }}
        >
          منو
        </Typography>
        <List disablePadding>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = item.href ? isActivePath(pathname, item.href) : false;
            return (
              <ListItemButton
                key={item.label}
                selected={active}
                onClick={() => {
                  if (item.href) {
                    router.push(item.href);
                  }
                }}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.5,
                  py: 1,
                  color: "rgba(255,255,255,0.75)",
                  "&.Mui-selected": {
                    bgcolor: "rgba(255,255,255,0.08)",
                    color: "common.white",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.12)",
                    },
                  },
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.06)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: { fontSize: 14, fontWeight: active ? 600 : 500 },
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <ListItemButton
        onClick={handleLogout}
        sx={{
          borderRadius: 1.5,
          mt: "auto",
          flexGrow: 0,
          py: 1,
          color: "rgba(255,255,255,0.75)",
          "&:hover": {
            bgcolor: "rgba(255,255,255,0.06)",
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
          <LogoutOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary="خروج"
          slotProps={{
            primary: { fontSize: 14, fontWeight: 500 },
          }}
        />
      </ListItemButton>
    </Box>
  );
}
