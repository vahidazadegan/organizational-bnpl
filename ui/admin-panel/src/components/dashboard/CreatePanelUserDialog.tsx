"use client";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession } from "@/lib/auth/session";
import {
  createPanelUser,
  listOrganizations,
  PanelUsersApiError,
} from "@/lib/panel-users/api";
import type {
  CreatePanelUserRequest,
  OrganizationSummary,
  PanelUserItem,
  PanelUserStatus,
} from "@/types/panel-user";

type CreateFormState = {
  organizationId: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: PanelUserStatus;
};

const EMPTY_FORM: CreateFormState = {
  organizationId: "",
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  status: "ACTIVE",
};

type CreatePanelUserDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (user: PanelUserItem) => void;
};

/** Parent should remount via `key` when opening so form state resets. */
export function CreatePanelUserDialog({
  open,
  onClose,
  onCreated,
}: CreatePanelUserDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState<CreateFormState>(EMPTY_FORM);
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadOrgs() {
      setLoadingOrgs(true);
      try {
        const result = await listOrganizations();
        if (!cancelled) {
          setOrganizations(result);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }
        if (err instanceof PanelUsersApiError && err.status === 401) {
          clearSession();
          router.replace("/login");
          return;
        }
        setError(
          err instanceof Error
            ? err.message
            : "خطا در دریافت فهرست سازمان‌ها.",
        );
      } finally {
        if (!cancelled) {
          setLoadingOrgs(false);
        }
      }
    }

    void loadOrgs();
    return () => {
      cancelled = true;
    };
  }, [open, router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!form.organizationId) {
      setError("انتخاب سازمان الزامی است.");
      return;
    }
    if (form.password.trim().length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }

    const payload: CreatePanelUserRequest = {
      organizationId: form.organizationId,
      username: form.username.trim(),
      password: form.password,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      status: form.status,
    };

    setSubmitting(true);
    try {
      const created = await createPanelUser(payload);
      onCreated(created);
      onClose();
    } catch (err) {
      if (err instanceof PanelUsersApiError && err.status === 401) {
        clearSession();
        router.replace("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "خطای ناشناخته رخ داد.");
    } finally {
      setSubmitting(false);
    }
  }

  const activeOrganizations = organizations.filter(
    (org) => org.status.toUpperCase() === "ACTIVE",
  );

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>افزودن کاربر سازمانی</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="create-panel-user-form"
          onSubmit={handleSubmit}
          spacing={2}
          sx={{ pt: 1 }}
        >
          {error ? <Alert severity="error">{error}</Alert> : null}
          <FormControl size="small" fullWidth required disabled={loadingOrgs || submitting}>
            <InputLabel id="create-org-label">سازمان</InputLabel>
            <Select
              labelId="create-org-label"
              label="سازمان"
              value={form.organizationId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, organizationId: e.target.value }))
              }
            >
              {activeOrganizations.map((org) => (
                <MenuItem key={org.id} value={org.id}>
                  {org.name} ({org.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="نام کاربری"
            value={form.username}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, username: e.target.value }))
            }
            size="small"
            required
            fullWidth
            disabled={submitting}
          />
          <TextField
            label="رمز عبور"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, password: e.target.value }))
            }
            size="small"
            required
            fullWidth
            disabled={submitting}
            helperText="حداقل ۸ کاراکتر"
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="نام"
              value={form.firstName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, firstName: e.target.value }))
              }
              size="small"
              required
              fullWidth
              disabled={submitting}
            />
            <TextField
              label="نام خانوادگی"
              value={form.lastName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, lastName: e.target.value }))
              }
              size="small"
              required
              fullWidth
              disabled={submitting}
            />
          </Stack>
          <TextField
            label="ایمیل"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
            size="small"
            fullWidth
            disabled={submitting}
          />
          <TextField
            label="موبایل"
            value={form.phone}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, phone: e.target.value }))
            }
            size="small"
            fullWidth
            disabled={submitting}
          />
          <FormControl size="small" fullWidth disabled={submitting}>
            <InputLabel id="create-status-label">وضعیت</InputLabel>
            <Select
              labelId="create-status-label"
              label="وضعیت"
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  status: e.target.value as PanelUserStatus,
                }))
              }
            >
              <MenuItem value="ACTIVE">فعال</MenuItem>
              <MenuItem value="INACTIVE">غیرفعال</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting} color="inherit">
          انصراف
        </Button>
        <Button
          type="submit"
          form="create-panel-user-form"
          variant="contained"
          disabled={submitting || loadingOrgs}
        >
          ذخیره
        </Button>
      </DialogActions>
    </Dialog>
  );
}
