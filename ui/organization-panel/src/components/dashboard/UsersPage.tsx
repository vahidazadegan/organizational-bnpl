"use client";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { clearSession } from "@/lib/auth/session";
import { fetchUserCredits, searchUsers, UsersApiError } from "@/lib/users/api";
import type { UserCreditItem, UserItem, UserStatus } from "@/types/user";

type UserFilters = {
  name: string;
  mobile: string;
  nationalId: string;
  status: "" | UserStatus;
};

const PAGE_SIZE = 8;

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "فعال",
  INACTIVE: "غیرفعال",
};

const EMPTY_FILTERS: UserFilters = {
  name: "",
  mobile: "",
  nationalId: "",
  status: "",
};

function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]!);
}

function formatBirthDate(value: string | null): string {
  if (!value) {
    return "—";
  }
  return toPersianDigits(value.replaceAll("-", "/"));
}

function formatMoney(value: number, currency: string): string {
  const unit = currency === "IRR" || !currency ? "﷼" : currency;
  return `${toPersianDigits(value.toLocaleString("en-US"))} ${unit}`;
}

function formatRate(value: number): string {
  return `${toPersianDigits(value)}٪`;
}

function formatInstant(value: string | null): string {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return toPersianDigits(
    new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date),
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  );
}

export function UsersPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<UserFilters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<UserFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuUser, setMenuUser] = useState<UserItem | null>(null);
  const [detailUser, setDetailUser] = useState<UserItem | null>(null);
  const [creditsUser, setCreditsUser] = useState<UserItem | null>(null);
  const [credits, setCredits] = useState<UserCreditItem[]>([]);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [creditsError, setCreditsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await searchUsers({
          name: applied.name,
          mobile: applied.mobile,
          nationalId: applied.nationalId,
          status: applied.status,
          page,
          size: PAGE_SIZE,
        });
        if (cancelled) {
          return;
        }
        setUsers(result.content);
        setTotalElements(result.totalElements);
        setTotalPages(Math.max(1, result.totalPages));
      } catch (err) {
        if (cancelled) {
          return;
        }
        if (err instanceof UsersApiError && err.status === 401) {
          clearSession();
          router.replace("/login");
          return;
        }
        setUsers([]);
        setTotalElements(0);
        setTotalPages(1);
        setError(err instanceof Error ? err.message : "خطای ناشناخته رخ داد.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [applied, page, router]);

  function applyFilters() {
    setApplied({ ...draft });
    setPage(1);
  }

  function resetFilters() {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
  }

  function openRowMenu(event: MouseEvent<HTMLElement>, user: UserItem) {
    setMenuAnchor(event.currentTarget);
    setMenuUser(user);
  }

  function closeRowMenu() {
    setMenuAnchor(null);
    setMenuUser(null);
  }

  function openDetailPopup() {
    if (!menuUser) {
      return;
    }
    setDetailUser(menuUser);
    closeRowMenu();
  }

  function closeDetailPopup() {
    setDetailUser(null);
  }

  async function openCreditsPopup() {
    if (!menuUser) {
      return;
    }
    const user = menuUser;
    closeRowMenu();
    setCreditsUser(user);
    setCredits([]);
    setCreditsError(null);
    setCreditsLoading(true);
    try {
      const result = await fetchUserCredits(user.id);
      setCredits(result);
    } catch (err) {
      if (err instanceof UsersApiError && err.status === 401) {
        clearSession();
        router.replace("/login");
        return;
      }
      setCreditsError(err instanceof Error ? err.message : "خطای ناشناخته رخ داد.");
    } finally {
      setCreditsLoading(false);
    }
  }

  function closeCreditsPopup() {
    setCreditsUser(null);
    setCredits([]);
    setCreditsError(null);
    setCreditsLoading(false);
  }

  const currentPage = Math.min(page, totalPages);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          کاربران
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          جست‌وجو و مشاهده کاربران سازمان.
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          applyFilters();
        }}
        sx={{
          bgcolor: "common.white",
          borderRadius: 1,
          p: 2.5,
          border: "1px solid",
          borderColor: "divider",
          "& .MuiOutlinedInput-root": {
            borderRadius: 1,
          },
          "& .MuiButton-root": {
            borderRadius: 1,
          },
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
          فیلترها
        </Typography>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1.2fr 1fr 1fr 0.9fr",
            },
          }}
        >
          <TextField
            label="نام و نام خانوادگی"
            value={draft.name}
            onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
            size="small"
            fullWidth
          />
          <TextField
            label="موبایل"
            value={draft.mobile}
            onChange={(e) => setDraft((prev) => ({ ...prev, mobile: e.target.value }))}
            size="small"
            fullWidth
            slotProps={{ htmlInput: { inputMode: "numeric" } }}
          />
          <TextField
            label="کد ملی"
            value={draft.nationalId}
            onChange={(e) => setDraft((prev) => ({ ...prev, nationalId: e.target.value }))}
            size="small"
            fullWidth
            slotProps={{ htmlInput: { inputMode: "numeric" } }}
          />
          <FormControl size="small" fullWidth>
            <InputLabel id="user-status-filter-label">وضعیت</InputLabel>
            <Select
              labelId="user-status-filter-label"
              label="وضعیت"
              value={draft.status}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  status: e.target.value as UserFilters["status"],
                }))
              }
            >
              <MenuItem value="">همه</MenuItem>
              <MenuItem value="ACTIVE">فعال</MenuItem>
              <MenuItem value="INACTIVE">غیرفعال</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ mt: 2 }}
          justifyContent="flex-end"
        >
          <Button
            type="button"
            variant="outlined"
            color="inherit"
            onClick={resetFilters}
            disabled={loading}
          >
            پاک کردن جست‌وجو
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SearchOutlinedIcon />}
            disabled={loading}
            sx={{
              bgcolor: "#3C50E0",
              color: "common.white",
              backgroundImage: "none",
              "&:hover": { bgcolor: "#2E3FB8", backgroundImage: "none" },
            }}
          >
            جست‌وجو
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          bgcolor: "common.white",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2.5, py: 2, borderBottom: "1px solid", borderColor: "divider" }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            نتایج جست‌وجو
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {loading ? "…" : `${toPersianDigits(totalElements)} کاربر`}
          </Typography>
        </Stack>

        {error ? (
          <Box sx={{ p: 2.5 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : null}

        {loading ? (
          <Box sx={{ p: 2.5 }}>
            <Stack spacing={1.5}>
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} variant="rounded" height={36} />
              ))}
            </Stack>
          </Box>
        ) : null}

        {!loading && !error && users.length === 0 ? (
          <Box sx={{ p: 2.5 }}>
            <Alert severity="info">کاربری با این فیلترها پیدا نشد.</Alert>
          </Box>
        ) : null}

        {!loading && !error && users.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  <TableCell sx={{ fontWeight: 700 }}>نام</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>نام خانوادگی</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>موبایل</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>کد ملی</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>وضعیت</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center" width={56}>
                    عملیات
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.firstName}</TableCell>
                    <TableCell>{user.lastName}</TableCell>
                    <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>
                      {toPersianDigits(user.mobile)}
                    </TableCell>
                    <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>
                      {toPersianDigits(user.nationalId)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={STATUS_LABEL[user.status] ?? user.status}
                        color={user.status === "ACTIVE" ? "success" : "default"}
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        aria-label="عملیات کاربر"
                        onClick={(event) => openRowMenu(event, user)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : null}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems="center"
          justifyContent="space-between"
          spacing={1.5}
          sx={{ px: 2.5, py: 2, borderTop: "1px solid", borderColor: "divider" }}
        >
          <Typography variant="caption" color="text.secondary">
            صفحه {toPersianDigits(currentPage)} از {toPersianDigits(totalPages)}
          </Typography>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
            siblingCount={0}
            boundaryCount={1}
            disabled={loading}
            sx={{
              "& .MuiPaginationItem-root": {
                borderRadius: 1,
              },
            }}
          />
        </Stack>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeRowMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem onClick={openDetailPopup}>
          <ListItemIcon>
            <PersonOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>جزئیات کاربر</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => void openCreditsPopup()}>
          <ListItemIcon>
            <AccountBalanceWalletOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>اعتبارات</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog
        open={Boolean(detailUser)}
        onClose={closeDetailPopup}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>جزئیات کاربر</DialogTitle>
        <DialogContent>
          {detailUser ? (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                {detailUser.firstName} {detailUser.lastName}
              </Typography>
              <Divider />
              <Box
                sx={{
                  display: "grid",
                  gap: 1.5,
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                }}
              >
                <DetailField label="نام" value={detailUser.firstName} />
                <DetailField label="نام خانوادگی" value={detailUser.lastName} />
                <DetailField
                  label="موبایل"
                  value={toPersianDigits(detailUser.mobile)}
                />
                <DetailField
                  label="کد ملی"
                  value={toPersianDigits(detailUser.nationalId)}
                />
                <DetailField
                  label="تاریخ تولد"
                  value={formatBirthDate(detailUser.birthDate)}
                />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    وضعیت
                  </Typography>
                  <Chip
                    size="small"
                    label={STATUS_LABEL[detailUser.status] ?? detailUser.status}
                    color={detailUser.status === "ACTIVE" ? "success" : "default"}
                    variant="outlined"
                    sx={{ fontWeight: 600, mt: 0.5 }}
                  />
                </Box>
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDetailPopup} color="inherit">
            بستن
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(creditsUser)}
        onClose={closeCreditsPopup}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          اعتبارات
          {creditsUser
            ? ` — ${creditsUser.firstName} ${creditsUser.lastName}`
            : ""}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {creditsLoading ? (
              <Stack spacing={1.5}>
                {Array.from({ length: 3 }, (_, index) => (
                  <Skeleton key={index} variant="rounded" height={36} />
                ))}
              </Stack>
            ) : null}

            {!creditsLoading && creditsError ? (
              <Alert severity="error">{creditsError}</Alert>
            ) : null}

            {!creditsLoading && !creditsError && credits.length === 0 ? (
              <Alert severity="info">اعتباری برای این کاربر ثبت نشده است.</Alert>
            ) : null}

            {!creditsLoading && !creditsError && credits.length > 0 ? (
              <TableContainer
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                      <TableCell sx={{ fontWeight: 700 }}>سقف اعتبار</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>مصرف‌شده</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>نرخ سود</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>ماه بازپرداخت</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>بازه اعتبار</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>وضعیت</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {credits.map((credit) => (
                      <TableRow key={credit.id} hover>
                        <TableCell sx={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                          {formatMoney(credit.creditLimit, credit.currency)}
                        </TableCell>
                        <TableCell sx={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                          {formatMoney(credit.usedCredit, credit.currency)}
                        </TableCell>
                        <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>
                          {formatRate(credit.annualInterestRate)}
                        </TableCell>
                        <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>
                          {toPersianDigits(credit.repaymentMonths)}
                        </TableCell>
                        <TableCell sx={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                          {formatInstant(credit.validFrom)} تا {formatInstant(credit.validUntil)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={STATUS_LABEL[credit.status] ?? credit.status}
                            color={credit.status === "ACTIVE" ? "success" : "default"}
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeCreditsPopup} color="inherit">
            بستن
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
