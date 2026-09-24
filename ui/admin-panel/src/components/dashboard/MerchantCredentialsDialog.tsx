"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

type MerchantCredentialsDialogProps = {
  open: boolean;
  title: string;
  accessId: string;
  accessKey: string;
  onClose: () => void;
};

export function MerchantCredentialsDialog({
  open,
  title,
  accessId,
  accessKey,
  onClose,
}: MerchantCredentialsDialogProps) {
  const [copied, setCopied] = useState<"id" | "key" | null>(null);

  async function copy(value: string, which: "id" | "key") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
    } catch {
      setCopied(null);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      TransitionProps={{
        onExited: () => setCopied(null),
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Alert severity="warning">
            AccessKey فقط همین یک‌بار نمایش داده می‌شود. آن را در جای امن ذخیره کنید.
          </Alert>
          <TextField
            label="AccessID"
            value={accessId}
            fullWidth
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="کپی AccessID"
                    onClick={() => void copy(accessId, "id")}
                    edge="end"
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="AccessKey"
            value={accessKey}
            fullWidth
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="کپی AccessKey"
                    onClick={() => void copy(accessKey, "key")}
                    edge="end"
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {copied ? (
            <Typography variant="caption" color="success.main">
              {copied === "id" ? "AccessID کپی شد." : "AccessKey کپی شد."}
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="contained" onClick={onClose}>
          متوجه شدم
        </Button>
      </DialogActions>
    </Dialog>
  );
}
