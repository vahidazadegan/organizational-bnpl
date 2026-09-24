"use client";

import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import {
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";

function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]!);
}

function formatToman(value: number): string {
  return `${toPersianDigits(value.toLocaleString("en-US"))} تومان`;
}

const KPI_ITEMS: {
  label: string;
  value: string;
  hint: string;
  Icon: SvgIconComponent;
  tone: "primary" | "success" | "warning" | "info";
}[] = [
  {
    label: "سازمان‌ها",
    value: "۲۴",
    hint: "۳ سازمان جدید این ماه",
    Icon: BusinessOutlinedIcon,
    tone: "primary",
  },
  {
    label: "پذیرندگان",
    value: "۱۸",
    hint: "۲ پذیرنده در انتظار فعال‌سازی",
    Icon: StorefrontOutlinedIcon,
    tone: "info",
  },
  {
    label: "کاربران پنل",
    value: "۶۱",
    hint: "۱۲ کاربر فعال امروز",
    Icon: PeopleAltOutlinedIcon,
    tone: "success",
  },
  {
    label: "حجم خرید ماه",
    value: "۴٫۸",
    hint: "میلیارد تومان · +۱۲٪ نسبت به ماه قبل",
    Icon: PaymentsOutlinedIcon,
    tone: "warning",
  },
];

const MONTHLY_PURCHASES = [
  { month: "فروردین", amount: 2.1 },
  { month: "اردیبهشت", amount: 2.6 },
  { month: "خرداد", amount: 3.0 },
  { month: "تیر", amount: 2.8 },
  { month: "مرداد", amount: 3.7 },
  { month: "شهریور", amount: 4.8 },
];

const MERCHANT_SHARE = [
  { name: "فروشگاه آفتاب", share: 28 },
  { name: "دیجی‌کالا پارتنر", share: 22 },
  { name: "هایپرمارکت نور", share: 18 },
  { name: "پوشاک سپهر", share: 14 },
  { name: "سایر", share: 18 },
];

const RECENT_ACTIVITY = [
  {
    time: "۱۰ دقیقه پیش",
    actor: "پذیرنده تستی",
    action: "اعلام خرید",
    amount: 12_500_000,
    status: "COMPLETED",
  },
  {
    time: "۴۵ دقیقه پیش",
    actor: "سازمان ORG-DEMO-01",
    action: "تخصیص اعتبار",
    amount: 500_000_000,
    status: "COMPLETED",
  },
  {
    time: "۲ ساعت پیش",
    actor: "کاربر سازمانی ali.m",
    action: "ورود به پنل",
    amount: null,
    status: "INFO",
  },
  {
    time: "دیروز",
    actor: "پذیرنده آفتاب",
    action: "خرید لغوشده (OTP)",
    amount: 3_200_000,
    status: "CANCELLED",
  },
  {
    time: "دیروز",
    actor: "ادمین سیستم",
    action: "ایجاد پذیرنده",
    amount: null,
    status: "INFO",
  },
];

const STATUS_CHIP: Record<
  string,
  { label: string; color: "success" | "error" | "default" | "info" }
> = {
  COMPLETED: { label: "موفق", color: "success" },
  CANCELLED: { label: "لغو", color: "error" },
  INFO: { label: "رویداد", color: "info" },
};

function PanelCard({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        bgcolor: "common.white",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        p: 2.5,
        height: "100%",
      }}
    >
      {children}
    </Box>
  );
}

function MonthlyPurchasesChart() {
  const theme = useTheme();
  const max = Math.max(...MONTHLY_PURCHASES.map((item) => item.amount));
  const width = 560;
  const height = 220;
  const padX = 28;
  const padY = 24;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const points = MONTHLY_PURCHASES.map((item, index) => {
    const x =
      padX + (index / Math.max(MONTHLY_PURCHASES.length - 1, 1)) * chartW;
    const y = padY + chartH - (item.amount / max) * chartH;
    return { ...item, x, y };
  });

  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const area = `${line} L ${points[points.length - 1]!.x} ${padY + chartH} L ${points[0]!.x} ${padY + chartH} Z`;

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={220}
        role="img"
        aria-label="نمودار حجم خرید ماهانه"
      >
        {[0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padY + chartH - ratio * chartH;
          return (
            <line
              key={ratio}
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              stroke={theme.palette.divider}
              strokeDasharray="4 4"
            />
          );
        })}
        <path d={area} fill={theme.palette.primary.main} opacity={0.12} />
        <path
          d={line}
          fill="none"
          stroke={theme.palette.primary.main}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((point) => (
          <g key={point.month}>
            <circle
              cx={point.x}
              cy={point.y}
              r={4.5}
              fill={theme.palette.common.white}
              stroke={theme.palette.primary.main}
              strokeWidth={2}
            />
            <text
              x={point.x}
              y={height - 4}
              textAnchor="middle"
              fill={theme.palette.text.secondary}
              fontSize={11}
            >
              {point.month}
            </text>
            <text
              x={point.x}
              y={point.y - 10}
              textAnchor="middle"
              fill={theme.palette.text.primary}
              fontSize={11}
              fontWeight={600}
            >
              {toPersianDigits(point.amount)}
            </text>
          </g>
        ))}
      </svg>
    </Box>
  );
}

function MerchantShareBars() {
  const theme = useTheme();
  return (
    <Stack spacing={1.75}>
      {MERCHANT_SHARE.map((item) => (
        <Box key={item.name}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="baseline"
            sx={{ mb: 0.5 }}
          >
            <Typography variant="body2" fontWeight={600}>
              {item.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {toPersianDigits(item.share)}٪
            </Typography>
          </Stack>
          <Box
            sx={{
              height: 8,
              borderRadius: 999,
              bgcolor: "action.hover",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${item.share}%`,
                height: "100%",
                borderRadius: 999,
                bgcolor: theme.palette.primary.main,
              }}
            />
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

export function DashboardHome() {
  const theme = useTheme();

  const toneColor = {
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
  } as const;

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "flex-start" }}
        spacing={1.5}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} color="text.primary">
            داشبورد ادمین
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            نمای کلی وضعیت پلتفرم BNPL سازمانی
          </Typography>
        </Box>
        <Chip
          size="small"
          label="داده‌های نمایشی (Mock)"
          variant="outlined"
          color="default"
          sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
        />
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            lg: "repeat(4, 1fr)",
          },
        }}
      >
        {KPI_ITEMS.map((item) => (
          <PanelCard key={item.label}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: `${toneColor[item.tone]}14`,
                  color: toneColor[item.tone],
                  flexShrink: 0,
                }}
              >
                <item.Icon fontSize="small" />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
                  {item.value}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 0.5 }}
                >
                  {item.hint}
                </Typography>
              </Box>
            </Stack>
          </PanelCard>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", lg: "1.6fr 1fr" },
        }}
      >
        <PanelCard>
          <Typography variant="subtitle1" fontWeight={700}>
            حجم خرید ماهانه
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            میلیارد تومان · شش‌ماه اخیر
          </Typography>
          <MonthlyPurchasesChart />
        </PanelCard>

        <PanelCard>
          <Typography variant="subtitle1" fontWeight={700}>
            سهم پذیرندگان از خرید
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            توزیع تقریبی ماه جاری
          </Typography>
          <MerchantShareBars />
        </PanelCard>
      </Box>

      <PanelCard>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
          فعالیت‌های اخیر
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          نمونه رویدادهای سامانه برای نمایش UI
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>زمان</TableCell>
                <TableCell>عامل</TableCell>
                <TableCell>رویداد</TableCell>
                <TableCell>مبلغ</TableCell>
                <TableCell>وضعیت</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {RECENT_ACTIVITY.map((row) => {
                const chip = STATUS_CHIP[row.status] ?? STATUS_CHIP.INFO!;
                return (
                  <TableRow key={`${row.time}-${row.action}`} hover>
                    <TableCell>{row.time}</TableCell>
                    <TableCell>{row.actor}</TableCell>
                    <TableCell>{row.action}</TableCell>
                    <TableCell>
                      {row.amount != null ? formatToman(row.amount) : "—"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={chip.label}
                        color={chip.color}
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </PanelCard>
    </Stack>
  );
}
