"use client";

import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
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
  InputLabel,
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
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { clearSession } from "@/lib/auth/session";
import { importUsers, searchUsers, UsersApiError } from "@/lib/users/api";
import type { UserImportResponse, UserItem, UserStatus } from "@/types/user";

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

export function UsersPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<UserFilters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<UserFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<UserImportResponse | null>(null);

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
  }, [applied, page, reloadToken, router]);

  function applyFilters() {
    setApplied({ ...draft });
    setPage(1);
  }

  function resetFilters() {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
  }

  function openImportDialog() {
    setSelectedFile(null);
    setImportError(null);
    setImportResult(null);
    setImportOpen(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function closeImportDialog() {
    if (importing) {
      return;
    }
    setImportOpen(false);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setImportError(null);
    setImportResult(null);
  }

  async function submitImport() {
    if (!selectedFile) {
      setImportError("لطفاً یک فایل CSV انتخاب کنید.");
      return;
    }

    setImporting(true);
    setImportError(null);
    setImportResult(null);
    try {
      const result = await importUsers(selectedFile);
      setImportResult(result);
      setReloadToken((value) => value + 1);
    } catch (err) {
      if (err instanceof UsersApiError && err.status === 401) {
        clearSession();
        router.replace("/login");
        return;
      }
      setImportError(err instanceof Error ? err.message : "خطای ناشناخته رخ داد.");
    } finally {
      setImporting(false);
    }
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
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ mt: 2 }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <Button
            variant="outlined"
            startIcon={<CloudUploadOutlinedIcon />}
            onClick={openImportDialog}
            disabled={loading}
          >
            بارگذاری فایل
          </Button>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" color="inherit" onClick={resetFilters} disabled={loading}>
              پاک کردن جست‌وجو
            </Button>
            <Button
              variant="contained"
              startIcon={<SearchOutlinedIcon />}
              onClick={applyFilters}
              disabled={loading}
              sx={{ bgcolor: "#3C50E0", "&:hover": { bgcolor: "#2E3FB8" } }}
            >
              جست‌وجو
            </Button>
          </Stack>
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
                  <TableCell sx={{ fontWeight: 700 }}>تاریخ تولد</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>وضعیت</TableCell>
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
                    <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatBirthDate(user.birthDate)}
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

      <Dialog open={importOpen} onClose={closeImportDialog} fullWidth maxWidth="sm">
        <DialogTitle>بارگذاری فایل کاربران</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              فایل CSV با ستون‌های first_name، last_name، mobile، national_id را انتخاب کنید.
              ستون‌های birth_date و status اختیاری‌اند.
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadOutlinedIcon />}
              disabled={importing}
              sx={{ alignSelf: "flex-start", borderRadius: 1 }}
            >
              انتخاب فایل
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            <Typography variant="body2" color={selectedFile ? "text.primary" : "text.secondary"}>
              {selectedFile ? selectedFile.name : "فایلی انتخاب نشده است."}
            </Typography>
            {importError ? <Alert severity="error">{importError}</Alert> : null}
            {importResult ? (
              <Alert severity={importResult.errors.length > 0 ? "warning" : "success"}>
                از {toPersianDigits(importResult.totalRows)} ردیف،{" "}
                {toPersianDigits(importResult.imported)} وارد شد و{" "}
                {toPersianDigits(importResult.skipped)} رد شد.
                {importResult.errors.length > 0
                  ? ` (${toPersianDigits(importResult.errors.length)} خطا)`
                  : ""}
              </Alert>
            ) : null}
            {importResult && importResult.errors.length > 0 ? (
              <Box
                sx={{
                  maxHeight: 160,
                  overflow: "auto",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1.5,
                }}
              >
                <Stack spacing={0.75}>
                  {importResult.errors.slice(0, 10).map((rowError) => (
                    <Typography key={`${rowError.rowNumber}-${rowError.message}`} variant="caption">
                      ردیف {toPersianDigits(rowError.rowNumber)}: {rowError.message}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeImportDialog} disabled={importing} color="inherit">
            {importResult ? "بستن" : "انصراف"}
          </Button>
          {!importResult ? (
            <Button
              variant="contained"
              onClick={() => void submitImport()}
              disabled={importing || !selectedFile}
              sx={{ bgcolor: "#3C50E0", "&:hover": { bgcolor: "#2E3FB8" } }}
            >
              {importing ? "در حال بارگذاری…" : "بارگذاری"}
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
