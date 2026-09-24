"use client";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession } from "@/lib/auth/session";
import { MerchantsApiError, updateMerchant } from "@/lib/merchants/api";
import type { MerchantItem, UpdateMerchantRequest } from "@/types/merchant";

type FormState = {
  name: string;
  phone: string;
  email: string;
};

type EditMerchantDialogProps = {
  open: boolean;
  merchant: MerchantItem | null;
  onClose: () => void;
  onUpdated: (merchant: MerchantItem) => void;
};

export function EditMerchantDialog({
  open,
  merchant,
  onClose,
  onUpdated,
}: EditMerchantDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ name: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && merchant) {
      setForm({
        name: merchant.name,
        phone: merchant.phone ?? "",
        email: merchant.email ?? "",
      });
      setError(null);
    }
  }, [open, merchant]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!merchant) {
      return;
    }
    setError(null);

    const payload: UpdateMerchantRequest = {
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
    };

    if (!payload.name) {
      setError("نام پذیرنده الزامی است.");
      return;
    }

    setSubmitting(true);
    try {
      const updated = await updateMerchant(merchant.id, payload);
      onUpdated(updated);
      onClose();
    } catch (err) {
      if (err instanceof MerchantsApiError && err.status === 401) {
        clearSession();
        router.replace("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "خطا در ویرایش پذیرنده.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>ویرایش پذیرنده</DialogTitle>
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
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={submitting}>
            انصراف
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            ذخیره
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
