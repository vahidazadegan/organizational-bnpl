"use client";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
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
  FormControl,
  IconButton,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Pagination,
  PaginationItem,
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
import { useEffect, useState, type ComponentProps, type MouseEvent } from "react";
import { clearSession } from "@/lib/auth/session";
import { PurchasesApiError, fetchPurchaseInstallments, searchPurchases } from "@/lib/purchases/api";
import type {
  InstallmentItem,
  InstallmentStatus,
  PurchaseItem,
  PurchaseStatus,
} from "@/types/purchase";

type PurchaseFilters = {
  name: string;
  mobile: string;
  nationalId: string;
  status: "" | PurchaseStatus;
  orderNumber: string;
  shopName: string;
};

const PAGE_SIZE = 8;
const INSTALLMENTS_PAGE_SIZE = 8;

const STATUS_LABEL: Record<PurchaseStatus, string> = {
  PENDING: "در انتظار",
  AUTHORIZED: "تأیید شده",
  COMPLETED: "تکمیل‌شده",
  CANCELLED: "لغو شده",
  REFUNDED: "عودت‌شده",
  PARTIALLY_REFUNDED: "عودت جزئی",
};

const INSTALLMENT_STATUS_LABEL: Record<InstallmentStatus, string> = {
  PENDING: "در انتظار",
  PARTIALLY_PAID: "پرداخت جزئی",
  PAID: "پرداخت‌شده",
  OVERDUE: "معوق",
  CANCELLED: "لغو شده",
};

const EMPTY_FILTERS: PurchaseFilters = {
  name: "",
  mobile: "",
  nationalId: "",
  status: "",
  orderNumber: "",
  shopName: "",
};

function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]!);
}

function renderPersianPaginationItem(item: ComponentProps<typeof PaginationItem>) {
  const page =
    typeof item.page === "number" || typeof item.page === "string"
      ? toPersianDigits(item.page)
      : item.page;
  return <PaginationItem {...item} page={page} />;
}

function formatMoney(value: number, currency: string): string {
  const unit = currency === "IRR" || !currency ? "﷼" : currency;
  return `${toPersianDigits(value.toLocaleString("en-US"))} ${unit}`;
}

function formatRate(value: number): string {
  return `${toPersianDigits(value)}٪`;
}

function formatInstant(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return toPersianDigits(
    new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
  );
}

function formatLocalDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return toPersianDigits(value);
  }
  return toPersianDigits(
    new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date),
  );
}

function statusColor(
  status: PurchaseStatus,
): "default" | "success" | "warning" | "error" | "info" {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "AUTHORIZED":
    case "PENDING":
      return "info";
    case "CANCELLED":
      return "error";
    case "REFUNDED":
    case "PARTIALLY_REFUNDED":
      return "warning";
    default:
      return "default";
  }
}

function installmentStatusColor(
  status: InstallmentStatus,
): "default" | "success" | "warning" | "error" | "info" {
  switch (status) {
    case "PAID":
      return "success";
    case "PARTIALLY_PAID":
      return "info";
    case "PENDING":
      return "default";
    case "OVERDUE":
      return "warning";
    case "CANCELLED":
      return "error";
    default:
      return "default";
  }
}

export function PurchasesPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<PurchaseFilters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<PurchaseFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuPurchase, setMenuPurchase] = useState<PurchaseItem | null>(null);
  const [installmentsPurchase, setInstallmentsPurchase] =
    useState<PurchaseItem | null>(null);
  const [installments, setInstallments] = useState<InstallmentItem[]>([]);
  const [installmentsPage, setInstallmentsPage] = useState(1);
  const [installmentsTotalElements, setInstallmentsTotalElements] = useState(0);
  const [installmentsTotalPages, setInstallmentsTotalPages] = useState(1);
  const [installmentsLoading, setInstallmentsLoading] = useState(false);
  const [installmentsError, setInstallmentsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await searchPurchases({
          name: applied.name,
          mobile: applied.mobile,
          nationalId: applied.nationalId,
          status: applied.status,
          orderNumber: applied.orderNumber,
          shopName: applied.shopName,
          page,
          size: PAGE_SIZE,
        });
        if (cancelled) {
          return;
        }
        setPurchases(result.content);
        setTotalElements(result.totalElements);
        setTotalPages(Math.max(1, result.totalPages));
      } catch (err) {
        if (cancelled) {
          return;
        }
        if (err instanceof PurchasesApiError && err.status === 401) {
          clearSession();
          router.replace("/login");
          return;
        }
        setPurchases([]);
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

  useEffect(() => {
    if (!installmentsPurchase) {
      return;
    }

    const purchaseId = installmentsPurchase.id;
    let cancelled = false;

    async function loadInstallments() {
      setInstallmentsLoading(true);
      setInstallmentsError(null);
      try {
        const result = await fetchPurchaseInstallments(purchaseId, {
          page: installmentsPage,
          size: INSTALLMENTS_PAGE_SIZE,
        });
        if (cancelled) {
          return;
        }
        setInstallments(result.content);
        setInstallmentsTotalElements(result.totalElements);
        setInstallmentsTotalPages(Math.max(1, result.totalPages));
      } catch (err) {
        if (cancelled) {
          return;
        }
        if (err instanceof PurchasesApiError && err.status === 401) {
          clearSession();
          router.replace("/login");
          return;
        }
        setInstallments([]);
        setInstallmentsTotalElements(0);
        setInstallmentsTotalPages(1);
        setInstallmentsError(
          err instanceof Error ? err.message : "خطای ناشناخته رخ داد.",
        );
      } finally {
        if (!cancelled) {
          setInstallmentsLoading(false);
        }
      }
    }

    void loadInstallments();
    return () => {
      cancelled = true;
    };
  }, [installmentsPurchase, installmentsPage, router]);

  function applyFilters() {
    setApplied({ ...draft });
    setPage(1);
  }

  function resetFilters() {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
  }

  function openRowMenu(event: MouseEvent<HTMLElement>, purchase: PurchaseItem) {
    setMenuAnchor(event.currentTarget);
    setMenuPurchase(purchase);
  }

  function closeRowMenu() {
    setMenuAnchor(null);
    setMenuPurchase(null);
  }

  function openInstallmentsPopup() {
    if (!menuPurchase) {
      return;
    }
    setInstallmentsPurchase(menuPurchase);
    setInstallmentsPage(1);
    setInstallments([]);
    setInstallmentsTotalElements(0);
    setInstallmentsTotalPages(1);
    setInstallmentsError(null);
    closeRowMenu();
  }

  function closeInstallmentsPopup() {
    setInstallmentsPurchase(null);
    setInstallments([]);
    setInstallmentsPage(1);
    setInstallmentsTotalElements(0);
    setInstallmentsTotalPages(1);
    setInstallmentsError(null);
    setInstallmentsLoading(false);
  }

  const currentPage = Math.min(page, totalPages);
  const currentInstallmentsPage = Math.min(
    installmentsPage,
    installmentsTotalPages,
  );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          خریدها
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          جست‌وجو و مشاهده خریدهای اعتباری کاربران سازمان.
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
              md: "1fr 1fr 1fr",
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
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, nationalId: e.target.value }))
            }
            size="small"
            fullWidth
            slotProps={{ htmlInput: { inputMode: "numeric" } }}
          />
          <TextField
            label="شماره سفارش"
            value={draft.orderNumber}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, orderNumber: e.target.value }))
            }
            size="small"
            fullWidth
          />
          <TextField
            label="نام فروشگاه"
            value={draft.shopName}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, shopName: e.target.value }))
            }
            size="small"
            fullWidth
          />
          <FormControl size="small" fullWidth>
            <InputLabel id="purchase-status-filter-label">وضعیت</InputLabel>
            <Select
              labelId="purchase-status-filter-label"
              label="وضعیت"
              value={draft.status}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  status: e.target.value as PurchaseFilters["status"],
                }))
              }
            >
              <MenuItem value="">همه</MenuItem>
              {(Object.keys(STATUS_LABEL) as PurchaseStatus[]).map((status) => (
                <MenuItem key={status} value={status}>
                  {STATUS_LABEL[status]}
                </MenuItem>
              ))}
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
            {loading ? "…" : `${toPersianDigits(totalElements)} خرید`}
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

        {!loading && !error && purchases.length === 0 ? (
          <Box sx={{ p: 2.5 }}>
            <Alert severity="info">خریدی با این فیلترها پیدا نشد.</Alert>
          </Box>
        ) : null}

        {!loading && !error && purchases.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  <TableCell sx={{ fontWeight: 700 }}>کاربر</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>کد ملی</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>فروشگاه</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>شماره سفارش</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>مبلغ</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>اقساط (ماه)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>نرخ</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>تاریخ خرید</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>وضعیت</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center" width={56}>
                    عملیات
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id} hover>
                    <TableCell>
                      {purchase.userFirstName} {purchase.userLastName}
                    </TableCell>
                    <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>
                      {toPersianDigits(purchase.userNationalId)}
                    </TableCell>
                    <TableCell>{purchase.shopName || "—"}</TableCell>
                    <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>
                      {purchase.orderNumber
                        ? toPersianDigits(purchase.orderNumber)
                        : "—"}
                    </TableCell>
                    <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatMoney(purchase.amount, purchase.currency)}
                    </TableCell>
                    <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>
                      {toPersianDigits(purchase.repaymentMonths)}
                    </TableCell>
                    <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatRate(purchase.annualInterestRate)}
                    </TableCell>
                    <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatInstant(purchase.purchasedAt)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={STATUS_LABEL[purchase.status] ?? purchase.status}
                        color={statusColor(purchase.status)}
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        aria-label="عملیات خرید"
                        onClick={(event) => openRowMenu(event, purchase)}
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
            renderItem={renderPersianPaginationItem}
          />
        </Stack>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor && menuPurchase)}
        onClose={closeRowMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem onClick={openInstallmentsPopup}>
          <ListItemIcon>
            <PaymentsOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>اقساط</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog
        open={Boolean(installmentsPurchase)}
        onClose={closeInstallmentsPopup}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          اقساط
          {installmentsPurchase
            ? ` — ${installmentsPurchase.userFirstName} ${installmentsPurchase.userLastName}`
            : ""}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {installmentsPurchase ? (
              <Stack
                direction="row"
                flexWrap="wrap"
                alignItems="center"
                useFlexGap
                spacing={1}
                sx={{ color: "text.secondary" }}
              >
                <Typography variant="body2" color="inherit" component="span">
                  {installmentsPurchase.shopName || "بدون فروشگاه"}
                </Typography>
                {installmentsPurchase.orderNumber ? (
                  <>
                    <Typography variant="body2" color="inherit" component="span" aria-hidden>
                      ·
                    </Typography>
                    <Typography
                      variant="body2"
                      color="inherit"
                      component="span"
                      sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Box component="span">سفارش</Box>
                      <Box
                        component="span"
                        dir="ltr"
                        sx={{
                          unicodeBidi: "isolate",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {installmentsPurchase.orderNumber}
                      </Box>
                    </Typography>
                  </>
                ) : null}
                <Typography variant="body2" color="inherit" component="span" aria-hidden>
                  ·
                </Typography>
                <Typography
                  variant="body2"
                  color="inherit"
                  component="span"
                  dir="ltr"
                  sx={{
                    unicodeBidi: "isolate",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatMoney(
                    installmentsPurchase.amount,
                    installmentsPurchase.currency,
                  )}
                </Typography>
              </Stack>
            ) : null}

            {installmentsLoading ? (
              <Stack spacing={1.5}>
                {Array.from({ length: 4 }, (_, index) => (
                  <Skeleton key={index} variant="rounded" height={36} />
                ))}
              </Stack>
            ) : null}

            {!installmentsLoading && installmentsError ? (
              <Alert severity="error">{installmentsError}</Alert>
            ) : null}

            {!installmentsLoading &&
            !installmentsError &&
            installments.length === 0 ? (
              <Alert severity="info">قسطی برای این خرید ثبت نشده است.</Alert>
            ) : null}

            {!installmentsLoading &&
            !installmentsError &&
            installments.length > 0 ? (
              <>
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
                        <TableCell sx={{ fontWeight: 700 }}>شماره قسط</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>مبلغ</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>پرداخت‌شده</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>سررسید</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>وضعیت</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {installments.map((installment) => (
                        <TableRow key={installment.id} hover>
                          <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>
                            {toPersianDigits(installment.installmentNumber)}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontVariantNumeric: "tabular-nums",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatMoney(
                              installment.amount,
                              installmentsPurchase?.currency ?? "IRR",
                            )}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontVariantNumeric: "tabular-nums",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatMoney(
                              installment.paidAmount,
                              installmentsPurchase?.currency ?? "IRR",
                            )}
                          </TableCell>
                          <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>
                            {formatLocalDate(installment.dueDate)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                INSTALLMENT_STATUS_LABEL[installment.status] ??
                                installment.status
                              }
                              color={installmentStatusColor(installment.status)}
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1.5}
                >
                  <Typography variant="caption" color="text.secondary">
                    {toPersianDigits(installmentsTotalElements)} قسط · صفحه{" "}
                    {toPersianDigits(currentInstallmentsPage)} از{" "}
                    {toPersianDigits(installmentsTotalPages)}
                  </Typography>
                  <Pagination
                    count={installmentsTotalPages}
                    page={currentInstallmentsPage}
                    onChange={(_, value) => setInstallmentsPage(value)}
                    color="primary"
                    shape="rounded"
                    siblingCount={0}
                    boundaryCount={1}
                    disabled={installmentsLoading}
                    renderItem={renderPersianPaginationItem}
                  />
                </Stack>
              </>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeInstallmentsPopup} color="inherit">
            بستن
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
