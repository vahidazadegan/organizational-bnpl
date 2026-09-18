import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import {
  Box,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";

type StatCard = {
  label: string;
  value: string;
  hint: string;
  icon: SvgIconComponent;
  accent: string;
};

const stats: StatCard[] = [
  {
    label: "اعتبار تخصیص‌یافته",
    value: "۴٫۲ میلیارد",
    hint: "ریال · این ماه",
    icon: PaymentsOutlinedIcon,
    accent: "#3C50E0",
  },
  {
    label: "اعتبار مصرف‌شده",
    value: "۱٫۸ میلیارد",
    hint: "۴۳٪ از سقف",
    icon: TrendingUpOutlinedIcon,
    accent: "#10B981",
  },
  {
    label: "کاربران فعال",
    value: "۱۲۸",
    hint: "+۱۲ نسبت به هفته قبل",
    icon: GroupsOutlinedIcon,
    accent: "#F59E0B",
  },
  {
    label: "درخواست‌های باز",
    value: "۹",
    hint: "نیاز به بررسی",
    icon: HourglassEmptyOutlinedIcon,
    accent: "#EF4444",
  },
];

const recentRequests = [
  { name: "سارا محمدی", amount: "۱۲٬۰۰۰٬۰۰۰", status: "در انتظار", tone: "warning" as const },
  { name: "علی رضایی", amount: "۸٬۵۰۰٬۰۰۰", status: "تأیید شده", tone: "success" as const },
  { name: "مریم کریمی", amount: "۱۵٬۰۰۰٬۰۰۰", status: "رد شده", tone: "error" as const },
  { name: "حسین احمدی", amount: "۶٬۲۰۰٬۰۰۰", status: "در انتظار", tone: "warning" as const },
];

const creditUsage = [
  { label: "فروشگاه آنلاین", percent: 62 },
  { label: "خدمات رفاهی", percent: 38 },
  { label: "اقساط جاری", percent: 74 },
];

const quickActions = [
  "وارد کردن کاربران",
  "گزارش ماهانه",
  "تنظیم سقف اعتبار",
  "پیگیری اقساط",
];

export function DashboardHome() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          نمای کلی سازمان
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          خلاصه وضعیت اعتبار، کاربران و درخواست‌های BNPL — داده‌های نمونه برای پیش‌نمایش.
        </Typography>
      </Box>

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
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Box
              key={stat.label}
              sx={{
                bgcolor: "common.white",
                borderRadius: 2,
                p: 2.5,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ mt: 0.75 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    {stat.hint}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 1.5,
                    bgcolor: `${stat.accent}14`,
                    color: stat.accent,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Icon fontSize="small" />
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr" },
        }}
      >
        <Box
          sx={{
            bgcolor: "common.white",
            borderRadius: 2,
            p: 2.5,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            آخرین درخواست‌های اعتبار
          </Typography>
          <Stack spacing={1.5}>
            {recentRequests.map((item) => (
              <Stack
                key={`${item.name}-${item.amount}`}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
                sx={{
                  py: 1.25,
                  px: 1.5,
                  borderRadius: 1.5,
                  bgcolor: "#F8FAFC",
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.amount} ریال
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={item.status}
                  color={item.tone}
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
            ))}
          </Stack>
        </Box>

        <Stack spacing={2}>
          <Box
            sx={{
              bgcolor: "common.white",
              borderRadius: 2,
              p: 2.5,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              مصرف اعتبار بر اساس دسته
            </Typography>
            <Stack spacing={2}>
              {creditUsage.map((row) => (
                <Box key={row.label}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {row.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {row.percent}٪
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={row.percent}
                    sx={{
                      height: 8,
                      borderRadius: 999,
                      bgcolor: "#E2E8F0",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 999,
                        bgcolor: "#3C50E0",
                      },
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              borderRadius: 2,
              p: 2.5,
              background: "linear-gradient(135deg, #1C2434 0%, #3C50E0 100%)",
              color: "common.white",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              اقدام سریع
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, display: "block", mt: 0.5, mb: 2 }}>
              میانبرهای پرکاربرد پنل سازمانی
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1,
              }}
            >
              {quickActions.map((action) => (
                <Box
                  key={action}
                  sx={{
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 1.5,
                    bgcolor: "rgba(255,255,255,0.12)",
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  {action}
                </Box>
              ))}
            </Box>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
