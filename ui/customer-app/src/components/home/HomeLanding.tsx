"use client";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import {
  Alert,
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { clearSession, getStoredUser } from "@/lib/auth/session";
import { formatFaDate, formatToman, maskMobile } from "@/lib/format";
import { fetchHomeDashboard } from "@/lib/home/api";
import type { HomeDashboard, HomeInstallmentStatus } from "@/types/home";

const STATUS_LABEL: Record<HomeInstallmentStatus, string> = {
  PENDING: "در انتظار",
  OVERDUE: "سررسید گذشته",
  PAID: "پرداخت‌شده",
  PARTIALLY_PAID: "پرداخت جزئی",
};

const STATUS_COLOR: Record<
  HomeInstallmentStatus,
  "default" | "warning" | "error" | "success" | "info"
> = {
  PENDING: "info",
  OVERDUE: "error",
  PAID: "success",
  PARTIALLY_PAID: "warning",
};

function greetingByHour(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "صبح بخیر";
  if (hour < 18) return "عصر بخیر";
  return "شب بخیر";
}

export function HomeLanding() {
  const router = useRouter();
  const user = useMemo(() => getStoredUser(), []);
  const [dashboard, setDashboard] = useState<HomeDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const data = await fetchHomeDashboard();
        if (!cancelled) {
          setDashboard(data);
        }
      } catch {
        if (!cancelled) {
          setError("بارگذاری اطلاعات با خطا مواجه شد");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, user]);

  const usagePercent = useMemo(() => {
    if (!dashboard) return 0;
    const { usedAmount, totalLimit } = dashboard.credit;
    if (totalLimit <= 0) return 0;
    return Math.min(100, Math.round((usedAmount / totalLimit) * 100));
  }, [dashboard]);

  function handleLogout() {
    clearSession();
    router.replace("/");
  }

  if (loading) {
    return (
      <Box sx={{ px: 2.5, py: 3 }}>
        <Stack spacing={2}>
          <Skeleton variant="text" width="40%" height={32} />
          <Skeleton variant="rounded" height={168} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" height={88} sx={{ borderRadius: 1.5 }} />
          <Skeleton variant="rounded" height={220} sx={{ borderRadius: 1.5 }} />
        </Stack>
      </Box>
    );
  }

  if (error || !dashboard) {
    return (
      <Box sx={{ px: 2.5, py: 4 }}>
        <Alert severity="error">{error ?? "داده‌ای برای نمایش نیست"}</Alert>
      </Box>
    );
  }

  const { credit, installments, recentPurchases, nextDueAmount, nextDueDate } =
    dashboard;

  return (
    <Box component="main" sx={{ flex: 1, pb: 4 }}>
      <Box
        sx={{
          background:
            "linear-gradient(165deg, #0F766E 0%, #115E59 48%, #0E7490 100%)",
          color: "#fff",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 560,
            mx: "auto",
            px: 2.5,
            pt: 2.5,
            pb: 3,
          }}
        >
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {greetingByHour()}
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ mt: 0.25 }}>
                {user?.mobile ? maskMobile(user.mobile) : "مشتری گرامی"}
              </Typography>
            </Box>
            <IconButton
              aria-label="خروج"
              onClick={handleLogout}
              sx={{ color: "rgba(255,255,255,0.9)" }}
            >
              <LogoutOutlinedIcon />
            </IconButton>
          </Stack>

          <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.75 }}>
            باقیمانده اعتبار
          </Typography>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ letterSpacing: "-0.02em", mb: 2 }}
          >
            {formatToman(credit.remainingAmount)}
          </Typography>

          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                مصرف‌شده {formatToman(credit.usedAmount)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                سقف {formatToman(credit.totalLimit)}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={usagePercent}
              sx={{
                height: 8,
                borderRadius: 999,
                bgcolor: "rgba(255,255,255,0.22)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  bgcolor: "#5EEAD4",
                },
              }}
            />
          </Stack>
        </Box>
      </Box>

      <Stack
        spacing={2.5}
        sx={{
          width: "100%",
          maxWidth: 560,
          mx: "auto",
          px: 2.5,
          mt: -2,
        }}
      >
        <Stack direction="row" spacing={1.25}>
          <SummaryTile
            icon={<CalendarMonthOutlinedIcon fontSize="small" />}
            label="قسط بعدی"
            value={formatToman(nextDueAmount)}
            hint={nextDueDate ? formatFaDate(nextDueDate) : "—"}
          />
          <SummaryTile
            icon={<AccountBalanceWalletOutlinedIcon fontSize="small" />}
            label="درصد مصرف"
            value={`${usagePercent.toLocaleString("fa-IR")}٪`}
            hint="از سقف اعتبار"
          />
        </Stack>

        <Section
          title="اقساط پیش‌رو"
          icon={<ReceiptLongOutlinedIcon fontSize="small" />}
        >
          {installments.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              قسط فعالی ندارید.
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {installments.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    py: 1.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:last-child": { borderBottom: 0, pb: 0 },
                    "&:first-of-type": { pt: 0 },
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={700} noWrap>
                        {item.shopName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        قسط {item.installmentNumber.toLocaleString("fa-IR")} از{" "}
                        {item.totalInstallments.toLocaleString("fa-IR")} ·{" "}
                        {formatFaDate(item.dueDate)}
                      </Typography>
                    </Box>
                    <Stack alignItems="flex-end" spacing={0.75}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {formatToman(item.amount)}
                      </Typography>
                      <Chip
                        size="small"
                        label={STATUS_LABEL[item.status]}
                        color={STATUS_COLOR[item.status]}
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Section>

        <Section
          title="خریدهای اخیر"
          icon={<ShoppingBagOutlinedIcon fontSize="small" />}
        >
          {recentPurchases.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              هنوز خریدی ثبت نشده است.
            </Typography>
          ) : (
            <Stack spacing={0}>
              {recentPurchases.map((purchase) => (
                <Stack
                  key={purchase.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    py: 1.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:last-child": { borderBottom: 0 },
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {purchase.shopName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFaDate(purchase.purchasedAt)}
                    </Typography>
                  </Box>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography variant="body2" fontWeight={700}>
                      {formatToman(purchase.amount)}
                    </Typography>
                    <ChevronLeftIcon
                      sx={{ fontSize: 18, color: "text.disabled" }}
                    />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}
        </Section>
      </Stack>
    </Box>
  );
}

function SummaryTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        p: 1.75,
        borderRadius: 1.5,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1 }}>
        <Box sx={{ color: "primary.main", display: "grid" }}>{icon}</Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Stack>
      <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.3 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {hint}
      </Typography>
    </Box>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1.5,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ mb: 1.5 }}
      >
        <Box sx={{ color: "primary.main", display: "grid" }}>{icon}</Box>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
      </Stack>
      {children}
    </Box>
  );
}
