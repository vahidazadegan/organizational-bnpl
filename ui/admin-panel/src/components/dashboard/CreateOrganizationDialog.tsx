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
import { useState } from "react";
import { clearSession } from "@/lib/auth/session";
import {
  createOrganization,
  OrganizationsApiError,
} from "@/lib/organizations/api";
import type {
  CreateOrganizationRequest,
  OrganizationItem,
  OrganizationStatus,
} from "@/types/organization";

type FormState = {
  code: string;
  name: string;
  nationalId: string;
  email: string;
  phone: string;
  status: OrganizationStatus;
};

const EMPTY_FORM: FormState = {
  code: "",
  name: "",
  nationalId: "",
  email: "",
  phone: "",
  status: "ACTIVE",
};

type CreateOrganizationDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (org: OrganizationItem) => void;
};

/** Parent should remount via `key` when opening so form state resets. */
export function CreateOrganizationDialog({
  open,
  onClose,
  onCreated,
}: CreateOrganizationDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const payload: CreateOrganizationRequest = {
      code: form.code.trim(),
      name: form.name.trim(),
      nationalId: form.nationalId.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      status: form.status,
    };

    if (!payload.code || !payload.name) {
      setError("کد و نام سازمان الزامی است.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createOrganization(payload);
      onCreated(created);
      onClose();
    } catch (err) {
      if (err instanceof OrganizationsApiError && err.status === 401) {
        clearSession();
        router.replace("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "خطای ناشناخته رخ داد.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>افزودن سازمان</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="create-organization-form"
          onSubmit={handleSubmit}
          spacing={2}
          sx={{ pt: 1 }}
        >
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            label="کد سازمان"
            value={form.code}
            onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
            size="small"
            required
            fullWidth
            disabled={submitting}
          />
          <TextField
            label="نام سازمان"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            size="small"
            required
            fullWidth
            disabled={submitting}
          />
          <TextField
            label="شناسه ملی"
            value={form.nationalId}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, nationalId: e.target.value }))
            }
            size="small"
            fullWidth
            disabled={submitting}
          />
          <TextField
            label="ایمیل"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            size="small"
            fullWidth
            disabled={submitting}
          />
          <TextField
            label="تلفن"
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            size="small"
            fullWidth
            disabled={submitting}
          />
          <FormControl size="small" fullWidth disabled={submitting}>
            <InputLabel id="create-org-status-label">وضعیت</InputLabel>
            <Select
              labelId="create-org-status-label"
              label="وضعیت"
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  status: e.target.value as OrganizationStatus,
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
          form="create-organization-form"
          variant="contained"
          disabled={submitting}
        >
          ذخیره
        </Button>
      </DialogActions>
    </Dialog>
  );
}
