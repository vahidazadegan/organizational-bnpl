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
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { clearSession } from "@/lib/auth/session";
import { createMerchant, MerchantsApiError } from "@/lib/merchants/api";
import type {
  CreateMerchantRequest,
  MerchantCreatedResponse,
  MerchantStatus,
} from "@/types/merchant";

type FormState = {
  name: string;
  phone: string;
  email: string;
  status: MerchantStatus;
};

const EMPTY_FORM: FormState = {
  name: "",
  phone: "",
  email: "",
  status: "ACTIVE",
};

type CreateMerchantDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (merchant: MerchantCreatedResponse) => void;
};

/** Parent should remount via `key` when opening so form state resets. */
export function CreateMerchantDialog({
  open,
  onClose,
  onCreated,
}: CreateMerchantDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const payload: CreateMerchantRequest = {
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      status: form.status,
    };

    if (!payload.name) {
      setError("نام پذیرنده الزامی است.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createMerchant(payload);
      onCreated(created);
      onClose();
    } catch (err) {
      if (err instanceof MerchantsApiError && err.status === 401) {
        clearSession();
        router.replace("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "خطا در ایجاد پذیرنده.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>افزودن پذیرنده</DialogTitle>
      <form onSubmit={(event) => void handleSubmit(event)}>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <TextField
              label="نام"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              required
              fullWidth
              disabled={submitting}
            />
            <TextField
              label="تلفن"
              value={form.phone}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, phone: event.target.value }))
              }
              fullWidth
              disabled={submitting}
            />
            <TextField
              label="ایمیل"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              fullWidth
              disabled={submitting}
            />
            <FormControl fullWidth>
              <InputLabel id="merchant-status-label">وضعیت</InputLabel>
              <Select
                labelId="merchant-status-label"
                label="وضعیت"
                value={form.status}
                disabled={submitting}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    status: event.target.value as MerchantStatus,
                  }))
                }
              >
                <MenuItem value="ACTIVE">فعال</MenuItem>
                <MenuItem value="INACTIVE">غیرفعال</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              AccessID و AccessKey پس از ایجاد یک‌بار نمایش داده می‌شوند.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={submitting}>
            انصراف
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            ایجاد
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
