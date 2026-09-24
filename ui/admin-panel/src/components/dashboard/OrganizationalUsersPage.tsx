"use client";

import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
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
import { useEffect, useState } from "react";
import { CreatePanelUserDialog } from "@/components/dashboard/CreatePanelUserDialog";
import { clearSession } from "@/lib/auth/session";
import {
  PanelUsersApiError,
  searchPanelUsers,
  updatePanelUserStatus,
} from "@/lib/panel-users/api";
import type { PanelUserItem, PanelUserStatus } from "@/types/panel-user";

type PanelUserFilters = {
  username: string;
  name: string;
  organization: string;
  status: "" | PanelUserStatus;
};

const PAGE_SIZE = 8;

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "فعال",
  INACTIVE: "غیرفعال",
};

const EMPTY_FILTERS: PanelUserFilters = {
  username: "",
  name: "",
  organization: "",
  status: "",
};

function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]!);
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

export function OrganizationalUsersPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<PanelUserFilters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<PanelUserFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<PanelUserItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuUser, setMenuUser] = useState<PanelUserItem | null>(null);
  const [detailUser, setDetailUser] = useState<PanelUserItem | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await searchPanelUsers({
          username: applied.username,
          name: applied.name,
          organization: applied.organization,
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
        if (err instanceof PanelUsersApiError && err.status === 401) {
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
  }, [applied, page, router, reloadToken]);

  function applyFilters() {
    setApplied({ ...draft });
    setPage(1);
  }

  function resetFilters() {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
  }

  function handleUserCreated() {
    setPage(1);
    setReloadToken((value) => value + 1);
  }

  function openRowMenu(
    event: React.MouseEvent<HTMLElement>,
    user: PanelUserItem,
  ) {
    setMenuAnchor(event.currentTarget);
    setMenuUser(user);
    setActionError(null);
  }

  function closeRowMenu() {
    setMenuAnchor(null);
    setMenuUser(null);
  }

  function openDetailPopup() {
    if (menuUser) {
      setDetailUser(menuUser);
    }
    closeRowMenu();
  }

  function closeDetailPopup() {
    setDetailUser(null);
  }

  async function changeUserStatus(nextStatus: PanelUserStatus) {
    if (!menuUser) {
      return;
    }
    setStatusUpdating(true);
    setActionError(null);
    try {
      const updated = await updatePanelUserStatus(menuUser.id, {
        status: nextStatus,
      });
      setUsers((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      setDetailUser((prev) => (prev?.id === updated.id ? updated : prev));
      closeRowMenu();
    } catch (err) {
      if (err instanceof PanelUsersApiError && err.status === 401) {
        clearSession();
        router.replace("/login");
        return;
      }
      setActionError(
        err instanceof Error ? err.message : "خطا در تغییر وضعیت کاربر.",
      );
    } finally {
      setStatusUpdating(false);
    }
  }

  const currentPage = Math.min(page, totalPages);
  const menuOpen = Boolean(menuAnchor);
  const menuIsActive = menuUser?.status === "ACTIVE";

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
            کاربران سازمانی
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            جست‌وجو و مشاهده کاربران پنل سازمانی.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddAlt1OutlinedIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ alignSelf: { xs: "stretch", sm: "center" } }}
        >
          افزودن کاربر
        </Button>
      </Stack>

      <CreatePanelUserDialog
        key={createOpen ? "create-panel-user-open" : "create-panel-user-closed"}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleUserCreated}
      />
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          applyFilters();
        }}
        sx={{
          bgcolor: "common.white",
          borderRadius: 2,
          p: 2.5,
          border: "1px solid",
          borderColor: "divider",
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
              md: "1fr 1fr 1fr 0.9fr",
            },
          }}
        >
          <TextField
            label="نام کاربری"
            value={draft.username}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, username: e.target.value }))
            }
            size="small"
            fullWidth
          />
          <TextField
            label="نام و نام خانوادگی"
            value={draft.name}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, name: e.target.value }))
            }
            size="small"
            fullWidth
          />
          <TextField
            label="سازمان (نام یا کد)"
            value={draft.organization}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, organization: e.target.value }))
            }
            size="small"
            fullWidth
          />
          <FormControl size="small" fullWidth>
            <InputLabel id="panel-user-status-label">وضعیت</InputLabel>
            <Select
              labelId="panel-user-status-label"
              label="وضعیت"
              value={draft.status}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  status: e.target.value as "" | PanelUserStatus,
                }))
              }
            >
              <MenuItem value="">همه</MenuItem>
              <MenuItem value="ACTIVE">فعال</MenuItem>
              <MenuItem value="INACTIVE">غیرفعال</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SearchOutlinedIcon />}
          >
            جست‌وجو
          </Button>
          <Button type="button" variant="outlined" onClick={resetFilters}>
            پاک کردن
          </Button>
        </Stack>
      </Box>

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
                <TableCell>نام کاربری</TableCell>
                <TableCell>نام</TableCell>
                <TableCell>سازمان</TableCell>
                <TableCell>موبایل</TableCell>
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
              {!loading && users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      کاربری یافت نشد.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
              {!loading
                ? users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>
                        {`${user.firstName} ${user.lastName}`.trim()}
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Typography variant="body2" fontWeight={600}>
                            {user.organizationName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.organizationCode}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{user.phone || "—"}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={STATUS_LABEL[user.status] ?? user.status}
                          color={user.status === "ACTIVE" ? "success" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          aria-label="عملیات کاربر"
                          onClick={(event) => openRowMenu(event, user)}
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

        <Menu
          anchorEl={menuAnchor}
          open={menuOpen}
          onClose={statusUpdating ? undefined : closeRowMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <MenuItem onClick={openDetailPopup} disabled={statusUpdating}>
            <ListItemIcon>
              <PersonOutlineIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>جزئیات کاربر</ListItemText>
          </MenuItem>
          {menuIsActive ? (
            <MenuItem
              disabled={statusUpdating}
              onClick={() => void changeUserStatus("INACTIVE")}
            >
              <ListItemIcon>
                <PersonOffOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>غیرفعال‌سازی</ListItemText>
            </MenuItem>
          ) : (
            <MenuItem
              disabled={statusUpdating}
              onClick={() => void changeUserStatus("ACTIVE")}
            >
              <ListItemIcon>
                <CheckCircleOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>فعال‌سازی</ListItemText>
            </MenuItem>
          )}
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
                  {`${detailUser.firstName} ${detailUser.lastName}`.trim()}
                </Typography>
                <Divider />
                <Box
                  sx={{
                    display: "grid",
                    gap: 1.5,
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  }}
                >
                  <DetailField label="نام کاربری" value={detailUser.username} />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      وضعیت
                    </Typography>
                    <Chip
                      size="small"
                      label={STATUS_LABEL[detailUser.status] ?? detailUser.status}
                      color={
                        detailUser.status === "ACTIVE" ? "success" : "default"
                      }
                      variant="outlined"
                      sx={{ fontWeight: 600, mt: 0.5 }}
                    />
                  </Box>
                  <DetailField label="نام" value={detailUser.firstName} />
                  <DetailField
                    label="نام خانوادگی"
                    value={detailUser.lastName}
                  />
                  <DetailField
                    label="ایمیل"
                    value={detailUser.email || "—"}
                  />
                  <DetailField
                    label="موبایل"
                    value={
                      detailUser.phone
                        ? toPersianDigits(detailUser.phone)
                        : "—"
                    }
                  />
                  <DetailField
                    label="سازمان"
                    value={detailUser.organizationName}
                  />
                  <DetailField
                    label="کد سازمان"
                    value={detailUser.organizationCode}
                  />
                  <DetailField
                    label="آخرین ورود"
                    value={formatInstant(detailUser.lastLoginAt)}
                  />
                  <DetailField
                    label="تاریخ ایجاد"
                    value={formatInstant(detailUser.createdAt)}
                  />
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

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, py: 1.5, borderTop: "1px solid", borderColor: "divider" }}
        >
          <Typography variant="caption" color="text.secondary">
            {toPersianDigits(totalElements)} کاربر
          </Typography>
          <Pagination
            color="primary"
            page={currentPage}
            count={totalPages}
            onChange={(_, value) => setPage(value)}
            disabled={loading}
          />
        </Stack>
      </Box>
    </Stack>
  );
}
