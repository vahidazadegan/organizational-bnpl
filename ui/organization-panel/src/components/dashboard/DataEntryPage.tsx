"use client";

import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
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
  IconButton,
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
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth/session";
import {
  DataEntryApiError,
  downloadDataEntryResult,
  FILE_TYPE_LABEL,
  searchDataEntryFiles,
  STATUS_LABEL,
  uploadDataEntryFile,
} from "@/lib/data-entry/api";
import type {
  DataEntryFileItem,
  DataEntryFileStatus,
  DataEntryFileType,
} from "@/types/data-entry";

type DataEntryFilters = {
  fileName: string;
  fileType: "" | DataEntryFileType;
  status: "" | DataEntryFileStatus;
};

const PAGE_SIZE = 8;

const EMPTY_FILTERS: DataEntryFilters = {
  fileName: "",
  fileType: "",
  status: "",
};

const FILE_TYPES: DataEntryFileType[] = ["USERS"];

const STATUSES: DataEntryFileStatus[] = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
];

function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]!);
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
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

function statusColor(
  status: DataEntryFileStatus,
): "default" | "info" | "warning" | "success" | "error" {
  switch (status) {
    case "PENDING":
      return "warning";
    case "PROCESSING":
      return "info";
    case "COMPLETED":
      return "success";
    case "FAILED":
      return "error";
    default:
      return "default";
  }
}

function formatCount(value: number | null): string {
  if (value == null) {
    return "—";
  }
  return toPersianDigits(value);
}

export function DataEntryPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<DataEntryFilters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<DataEntryFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [files, setFiles] = useState<DataEntryFileItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<DataEntryFileType>("USERS");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await searchDataEntryFiles({
          fileName: applied.fileName,
          fileType: applied.fileType,
          status: applied.status,
          page,
          size: PAGE_SIZE,
        });
        if (cancelled) {
          return;
        }
        setFiles(result.content);
        setTotalElements(result.totalElements);
        setTotalPages(Math.max(1, result.totalPages));
      } catch (err) {
        if (cancelled) {
          return;
        }
        if (err instanceof DataEntryApiError && err.status === 401) {
          clearSession();
          router.replace("/login");
          return;
        }
        setFiles([]);
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

  function openUploadDialog() {
    setSelectedFile(null);
    setUploadType("USERS");
    setUploadError(null);
    setUploadSuccess(null);
    setUploadOpen(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function closeUploadDialog() {
    if (uploading) {
      return;
    }
    setUploadOpen(false);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setUploadError(null);
    setUploadSuccess(null);
  }

  async function submitUpload() {
    if (!selectedFile) {
      setUploadError("لطفاً یک فایل CSV انتخاب کنید.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const result = await uploadDataEntryFile(selectedFile, uploadType);
      const statusText = STATUS_LABEL[result.status] ?? result.status;
      setUploadSuccess(
        `فایل «${result.fileName}» پردازش شد. وضعیت: ${statusText}.`,
      );
      setReloadToken((value) => value + 1);
      setPage(1);
    } catch (err) {
      if (err instanceof DataEntryApiError && err.status === 401) {
        clearSession();
        router.replace("/login");
        return;
      }
      setUploadError(err instanceof Error ? err.message : "خطای ناشناخته رخ داد.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDownloadResult(item: DataEntryFileItem) {
    if (!item.hasResultFile) {
      return;
    }

    setDownloadingId(item.id);
    try {
      const blob = await downloadDataEntryResult(item.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = item.fileName.replace(/\.csv$/i, "") + "-result.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err instanceof DataEntryApiError && err.status === 401) {
        clearSession();
        router.replace("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "دانلود نتیجه ناموفق بود.");
    } finally {
      setDownloadingId(null);
    }
  }

  const currentPage = Math.min(page, totalPages);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          ورود اطلاعات
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          آپلود CSV کاربران، پیگیری پردازش و دانلود نتیجه.
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
              md: "1.4fr 1fr 1fr",
            },
          }}
        >
          <TextField
            label="نام فایل"
            value={draft.fileName}
            onChange={(e) => setDraft((prev) => ({ ...prev, fileName: e.target.value }))}
            size="small"
            fullWidth
          />
          <FormControl size="small" fullWidth>
            <InputLabel id="data-entry-type-filter-label">نوع فایل</InputLabel>
            <Select
              labelId="data-entry-type-filter-label"
              label="نوع فایل"
              value={draft.fileType}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  fileType: e.target.value as DataEntryFilters["fileType"],
                }))
              }
            >
              <MenuItem value="">همه</MenuItem>
              {FILE_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {FILE_TYPE_LABEL[type]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel id="data-entry-status-filter-label">وضعیت</InputLabel>
            <Select
              labelId="data-entry-status-filter-label"
              label="وضعیت"
              value={draft.status}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  status: e.target.value as DataEntryFilters["status"],
                }))
              }
            >
              <MenuItem value="">همه</MenuItem>
              {STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {STATUS_LABEL[status]}
                </MenuItem>
              ))}
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
            onClick={openUploadDialog}
            disabled={loading}
          >
            بارگذاری فایل
          </Button>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" color="inherit" onClick={resetFilters} disabled={loading}>
              پاک کردن فیلتر
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
            فهرست فایل‌ها
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {loading ? "…" : `${toPersianDigits(totalElements)} فایل`}
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

        {!loading && !error && files.length === 0 ? (
          <Box sx={{ p: 2.5 }}>
            <Alert severity="info">فایلی با این فیلترها پیدا نشد.</Alert>
          </Box>
        ) : null}

        {!loading && !error && files.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  <TableCell sx={{ fontWeight: 700 }}>نام فایل</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>نوع</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>وضعیت</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>تاریخ بارگذاری</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>بارگذاری‌کننده</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    کل
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    موفق
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    ناموفق
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    نتیجه
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.fileName}</TableCell>
                    <TableCell>{FILE_TYPE_LABEL[item.fileType]}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={STATUS_LABEL[item.status]}
                        color={statusColor(item.status)}
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                      {formatDateTime(item.uploadedAt)}
                    </TableCell>
                    <TableCell>{item.uploadedBy}</TableCell>
                    <TableCell align="center" sx={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatCount(item.totalRows)}
                    </TableCell>
                    <TableCell align="center" sx={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatCount(item.successRows)}
                    </TableCell>
                    <TableCell align="center" sx={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatCount(item.failedRows)}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip
                        title={
                          item.hasResultFile
                            ? "دانلود نتیجه پردازش"
                            : "نتیجه هنوز آماده نیست"
                        }
                      >
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            disabled={!item.hasResultFile || downloadingId === item.id}
                            onClick={() => void handleDownloadResult(item)}
                            aria-label="دانلود نتیجه"
                          >
                            <CloudDownloadOutlinedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
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

      <Dialog open={uploadOpen} onClose={closeUploadDialog} fullWidth maxWidth="sm">
        <DialogTitle>بارگذاری فایل CSV</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              فایل CSV کاربران را بارگذاری کنید. ستون‌های الزامی: first_name، last_name،
              mobile، national_id. پس از پردازش، فایل نتیجه از فهرست قابل دانلود است.
            </Typography>
            <FormControl size="small" fullWidth>
              <InputLabel id="data-entry-upload-type-label">نوع فایل</InputLabel>
              <Select
                labelId="data-entry-upload-type-label"
                label="نوع فایل"
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value as DataEntryFileType)}
                disabled={uploading || Boolean(uploadSuccess)}
              >
                {FILE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {FILE_TYPE_LABEL[type]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadOutlinedIcon />}
              disabled={uploading || Boolean(uploadSuccess)}
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
            {uploadError ? <Alert severity="error">{uploadError}</Alert> : null}
            {uploadSuccess ? <Alert severity="success">{uploadSuccess}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeUploadDialog} disabled={uploading} color="inherit">
            {uploadSuccess ? "بستن" : "انصراف"}
          </Button>
          {!uploadSuccess ? (
            <Button
              variant="contained"
              onClick={() => void submitUpload()}
              disabled={uploading || !selectedFile}
              sx={{ bgcolor: "#3C50E0", "&:hover": { bgcolor: "#2E3FB8" } }}
            >
              {uploading ? "در حال بارگذاری…" : "بارگذاری"}
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
