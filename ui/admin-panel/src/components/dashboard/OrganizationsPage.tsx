"use client";

import AddBusinessOutlinedIcon from "@mui/icons-material/AddBusinessOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
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
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreateOrganizationDialog } from "@/components/dashboard/CreateOrganizationDialog";
import { clearSession } from "@/lib/auth/session";
import {
  listOrganizations,
  OrganizationsApiError,
  updateOrganizationStatus,
} from "@/lib/organizations/api";
import type {
  OrganizationItem,
  OrganizationStatus,
} from "@/types/organization";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "فعال",
  INACTIVE: "غیرفعال",
};

function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]!);
}

export function OrganizationsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuOrg, setMenuOrg] = useState<OrganizationItem | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await listOrganizations();
        if (!cancelled) {
          setOrganizations(result);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }
        if (err instanceof OrganizationsApiError && err.status === 401) {
          clearSession();
          router.replace("/login");
          return;
        }
        setOrganizations([]);
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
    org: OrganizationItem,
  ) {
    setMenuAnchor(event.currentTarget);
    setMenuOrg(org);
    setActionError(null);
  }

  function closeRowMenu() {
    setMenuAnchor(null);
    setMenuOrg(null);
  }

  async function changeOrgStatus(nextStatus: OrganizationStatus) {
    if (!menuOrg) {
      return;
    }
    setStatusUpdating(true);
    setActionError(null);
    try {
      const updated = await updateOrganizationStatus(menuOrg.id, {
        status: nextStatus,
      });
      setOrganizations((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      closeRowMenu();
    } catch (err) {
      if (err instanceof OrganizationsApiError && err.status === 401) {
        clearSession();
        router.replace("/login");
        return;
      }
      setActionError(
        err instanceof Error ? err.message : "خطا در تغییر وضعیت سازمان.",
      );
    } finally {
      setStatusUpdating(false);
    }
  }

  const menuIsActive = menuOrg?.status === "ACTIVE";

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
            سازمان‌ها
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            مدیریت فهرست سازمان‌های سیستم.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddBusinessOutlinedIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ alignSelf: { xs: "stretch", sm: "center" } }}
        >
          افزودن سازمان
        </Button>
      </Stack>

      <CreateOrganizationDialog
        key={createOpen ? "create-org-open" : "create-org-closed"}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => setReloadToken((value) => value + 1)}
      />

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
                <TableCell>کد</TableCell>
                <TableCell>نام</TableCell>
                <TableCell>شناسه ملی</TableCell>
                <TableCell>تلفن</TableCell>
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
              {!loading && organizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      سازمانی یافت نشد.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
              {!loading
                ? organizations.map((org) => (
                    <TableRow key={org.id} hover>
                      <TableCell>{org.code}</TableCell>
                      <TableCell>{org.name}</TableCell>
                      <TableCell>
                        {org.nationalId
                          ? toPersianDigits(org.nationalId)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {org.phone ? toPersianDigits(org.phone) : "—"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={STATUS_LABEL[org.status] ?? org.status}
                          color={org.status === "ACTIVE" ? "success" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          aria-label="عملیات سازمان"
                          onClick={(event) => openRowMenu(event, org)}
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
            {toPersianDigits(organizations.length)} سازمان
          </Typography>
        </Stack>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={statusUpdating ? undefined : closeRowMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {menuIsActive ? (
          <MenuItem
            disabled={statusUpdating}
            onClick={() => void changeOrgStatus("INACTIVE")}
          >
            <ListItemIcon>
              <PersonOffOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>غیرفعال‌سازی</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem
            disabled={statusUpdating}
            onClick={() => void changeOrgStatus("ACTIVE")}
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
