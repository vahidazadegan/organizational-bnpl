"use client";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
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

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const menuSections: MenuSection[] = [
  {
    title: "منو",
    items: [
      { label: "داشبورد", icon: DashboardOutlinedIcon, href: "/dashboard" },
      { label: "کاربران", icon: GroupsOutlinedIcon, href: "/dashboard/users" },
      { label: "پروفایل", icon: PersonOutlineIcon },
      { label: "وظایف", icon: TaskAltOutlinedIcon },
      { label: "جداول", icon: TableChartOutlinedIcon },
    ],
  },
  {
    title: "پشتیبانی",
    items: [
      { label: "پیام‌ها", icon: MailOutlineIcon },
      { label: "صندوق ورودی", icon: InboxOutlinedIcon },
    ],
  },
  {
    title: "سایر",
    items: [
      { label: "نمودارها", icon: InsertChartOutlinedIcon },
      { label: "المان‌ها", icon: WidgetsOutlinedIcon },
    ],
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
          <InsertChartOutlinedIcon sx={{ fontSize: 20, color: "common.white" }} />
        </Box>
        <Typography variant="h6" fontWeight={700} letterSpacing={0.2}>
          پنل سازمانی
        </Typography>
      </Stack>

      <Stack spacing={3}>
        {menuSections.map((section) => (
          <Box key={section.title}>
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
              {section.title}
            </Typography>
            <List disablePadding>
              {section.items.map((item) => {
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
        ))}
      </Stack>

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
