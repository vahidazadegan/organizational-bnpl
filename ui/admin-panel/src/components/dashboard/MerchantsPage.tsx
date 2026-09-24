"use client";

import AddBusinessOutlinedIcon from "@mui/icons-material/AddBusinessOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
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
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
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
import { useEffect, useState } from "react";
import { CreateMerchantDialog } from "@/components/dashboard/CreateMerchantDialog";
import { EditMerchantDialog } from "@/components/dashboard/EditMerchantDialog";
import { MerchantCredentialsDialog } from "@/components/dashboard/MerchantCredentialsDialog";
import { clearSession } from "@/lib/auth/session";
import {
  listMerchants,
  MerchantsApiError,
  rotateMerchantAccessKey,
  updateMerchantStatus,
} from "@/lib/merchants/api";
import type {
  MerchantAccessKeyResponse,
  MerchantCreatedResponse,
  MerchantItem,
  MerchantStatus,
} from "@/types/merchant";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "فعال",
  INACTIVE: "غیرفعال",
};

function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]!);
}

function formatInstant(value: string | null | undefined): string {
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
      hour: "2-digit",
      minute: "2-digit",
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

export function MerchantsPage() {
  const router = useRouter();
  const [merchants, setMerchants] = useState<MerchantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [actionMerchant, setActionMerchant] = useState<MerchantItem | null>(
    null,
  );
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{
    title: string;
    accessId: string;
    accessKey: string;
  } | null>(null);
  const [accessIdCopied, setAccessIdCopied] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await listMerchants();
        if (!cancelled) {
          setMerchants(result);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }
        if (err instanceof MerchantsApiError && err.status === 401) {
          clearSession();
          router.replace("/login");
          return;
        }
        setMerchants([]);
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
  }, [router, reloadToken]);

  function openRowMenu(
    event: React.MouseEvent<HTMLElement>,
    merchant: MerchantItem,
  ) {
    setMenuAnchor(event.currentTarget);
    setActionMerchant(merchant);
    setActionError(null);
  }

  function closeRowMenu() {
    setMenuAnchor(null);
  }

  function clearActionMerchant() {
    setActionMerchant(null);
  }

  function handleCreated(created: MerchantCreatedResponse) {
    setMerchants((prev) =>
      [...prev, created].sort((a, b) => a.name.localeCompare(b.name, "fa")),
    );
    setCredentials({
      title: "کلیدهای دسترسی پذیرنده",
      accessId: created.accessId,
      accessKey: created.accessKey,
    });
  }

  async function changeStatus(nextStatus: MerchantStatus) {
    if (!actionMerchant) {
      return;
    }
    setStatusUpdating(true);
    setActionError(null);
    try {
      const updated = await updateMerchantStatus(actionMerchant.id, {
        status: nextStatus,
      });
      setMerchants((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      closeRowMenu();
      clearActionMerchant();
    } catch (err) {
      if (err instanceof MerchantsApiError && err.status === 401) {
        clearSession();
        router.replace("/login");
        return;
      }
      setActionError(
        err instanceof Error ? err.message : "خطا در تغییر وضعیت پذیرنده.",
      );
    } finally {
      setStatusUpdating(false);
    }
  }

  async function handleRotateKey() {
    if (!actionMerchant) {
      return;
    }
    setStatusUpdating(true);
    setActionError(null);
    try {
      const rotated: MerchantAccessKeyResponse = await rotateMerchantAccessKey(
        actionMerchant.id,
      );
      setCredentials({
        title: "کلید دسترسی جدید",
        accessId: rotated.accessId,
        accessKey: rotated.accessKey,
      });
      closeRowMenu();
      clearActionMerchant();
    } catch (err) {
      if (err instanceof MerchantsApiError && err.status === 401) {
        clearSession();
        router.replace("/login");
        return;
      }
      setActionError(
        err instanceof Error ? err.message : "خطا در چرخش کلید دسترسی.",
      );
    } finally {
      setStatusUpdating(false);
    }
  }

  const menuIsActive = actionMerchant?.status === "ACTIVE";

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "flex-start" }}
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="h5" fontWeight={700} color="text.primary">
            پذیرندگان
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            مدیریت پذیرندگان و کلیدهای دسترسی API.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddBusinessOutlinedIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ alignSelf: { xs: "stretch", sm: "center" } }}
        >
          افزودن پذیرنده
        </Button>
      </Stack>

      <CreateMerchantDialog
        key={createOpen ? "create-merchant-open" : "create-merchant-closed"}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />

      <EditMerchantDialog
        key={
          editOpen && actionMerchant
            ? `edit-merchant-${actionMerchant.id}`
            : "edit-merchant-closed"
        }
        open={editOpen}
        merchant={actionMerchant}
        onClose={() => {
          setEditOpen(false);
          closeRowMenu();
          clearActionMerchant();
        }}
        onUpdated={(updated) => {
          setMerchants((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item)),
          );
        }}
      />

      <MerchantCredentialsDialog
        open={Boolean(credentials)}
        title={credentials?.title ?? ""}
        accessId={credentials?.accessId ?? ""}
        accessKey={credentials?.accessKey ?? ""}
        onClose={() => setCredentials(null)}
      />

      <Dialog
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setAccessIdCopied(false);
          closeRowMenu();
          clearActionMerchant();
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>جزئیات پذیرنده</DialogTitle>
        <DialogContent>
          {actionMerchant ? (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
              >
                <Typography variant="h6" fontWeight={700}>
                  {actionMerchant.name}
                </Typography>
                <Chip
                  size="small"
                  label={
                    STATUS_LABEL[actionMerchant.status] ?? actionMerchant.status
                  }
                  color={
                    actionMerchant.status === "ACTIVE" ? "success" : "default"
                  }
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>

              <Divider />

              <Box
                sx={{
                  display: "grid",
                  gap: 1.5,
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                }}
              >
                <DetailField
                  label="تلفن"
                  value={
                    actionMerchant.phone
                      ? toPersianDigits(actionMerchant.phone)
                      : "—"
                  }
                />
                <DetailField
                  label="ایمیل"
                  value={actionMerchant.email ?? "—"}
                />
                <DetailField
                  label="تاریخ ایجاد"
                  value={formatInstant(actionMerchant.createdAt)}
                />
                <DetailField
                  label="آخرین به‌روزرسانی"
                  value={formatInstant(actionMerchant.updatedAt)}
                />
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mb: 0.75 }}
                >
                  AccessID
                </Typography>
                <TextField
                  value={actionMerchant.accessId}
                  fullWidth
                  size="small"
                  InputProps={{
                    readOnly: true,
                    sx: {
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, monospace",
                      fontSize: "0.8125rem",
                    },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          aria-label="کپی AccessID"
                          onClick={() => {
                            void navigator.clipboard
                              .writeText(actionMerchant.accessId)
                              .then(() => {
                                setAccessIdCopied(true);
                              })
                              .catch(() => {
                                setAccessIdCopied(false);
                              });
                          }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {accessIdCopied ? (
                  <Typography
                    variant="caption"
                    color="success.main"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    AccessID کپی شد.
                  </Typography>
                ) : null}
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setDetailsOpen(false);
              setAccessIdCopied(false);
              closeRowMenu();
              clearActionMerchant();
            }}
            color="inherit"
          >
            بستن
          </Button>
        </DialogActions>
      </Dialog>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {actionError ? <Alert severity="error">{actionError}</Alert> : null}

      <Box
        sx={{
          bgcolor: "common.white",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <TableContainer sx={{ px: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>نام</TableCell>
                <TableCell>تلفن</TableCell>
                <TableCell>ایمیل</TableCell>
                <TableCell>AccessID</TableCell>
                <TableCell>وضعیت</TableCell>
                <TableCell align="center" width={56}>
                  عملیات
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      {Array.from({ length: 6 }).map((__, cell) => (
                        <TableCell key={cell}>
                          <Skeleton variant="text" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : null}
              {!loading && merchants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      پذیرنده‌ای یافت نشد.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
              {!loading
                ? merchants.map((merchant) => (
                    <TableRow key={merchant.id} hover>
                      <TableCell>{merchant.name}</TableCell>
                      <TableCell>
                        {merchant.phone
                          ? toPersianDigits(merchant.phone)
                          : "—"}
                      </TableCell>
                      <TableCell>{merchant.email ?? "—"}</TableCell>
                      <TableCell sx={{ maxWidth: 180 }}>
                        <Typography
                          variant="body2"
                          noWrap
                          title={merchant.accessId}
                        >
                          {merchant.accessId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={STATUS_LABEL[merchant.status] ?? merchant.status}
                          color={
                            merchant.status === "ACTIVE" ? "success" : "default"
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          aria-label="عملیات پذیرنده"
                          onClick={(event) => openRowMenu(event, merchant)}
                          disabled={statusUpdating}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, py: 1.5, borderTop: "1px solid", borderColor: "divider" }}
        >
          <Typography variant="caption" color="text.secondary">
            {toPersianDigits(merchants.length)} پذیرنده
          </Typography>
          <Button
            size="small"
            onClick={() => setReloadToken((value) => value + 1)}
            disabled={loading}
          >
            به‌روزرسانی
          </Button>
        </Stack>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={statusUpdating ? undefined : closeRowMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem
          disabled={statusUpdating}
          onClick={() => {
            setAccessIdCopied(false);
            setDetailsOpen(true);
            setMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <InfoOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>جزئیات</ListItemText>
        </MenuItem>
        <MenuItem
          disabled={statusUpdating}
          onClick={() => {
            setEditOpen(true);
            setMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>ویرایش</ListItemText>
        </MenuItem>
        <MenuItem disabled={statusUpdating} onClick={() => void handleRotateKey()}>
          <ListItemIcon>
            <KeyOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>چرخش کلید</ListItemText>
        </MenuItem>
        {menuIsActive ? (
          <MenuItem
            disabled={statusUpdating}
            onClick={() => void changeStatus("INACTIVE")}
          >
            <ListItemIcon>
              <PersonOffOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>غیرفعال‌سازی</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem
            disabled={statusUpdating}
            onClick={() => void changeStatus("ACTIVE")}
          >
            <ListItemIcon>
              <CheckCircleOutlineIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>فعال‌سازی</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Stack>
  );
}
