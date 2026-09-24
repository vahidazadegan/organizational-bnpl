"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { requestOtp, saveSession, verifyOtp } from "@/lib/auth/session";

type Step = "mobile" | "otp";

const MOBILE_PATTERN = /^09\d{9}$/;
const OTP_PATTERN = /^\d{4,8}$/;

function normalizeMobile(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

function normalizeOtp(value: string): string {
  return value.replace(/\D/g, "").slice(0, 8);
}

function maskMobile(mobile: string): string {
  if (mobile.length < 4) {
    return mobile;
  }
  return `${mobile.slice(0, 4)}***${mobile.slice(-4)}`;
}

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const mobileValid = useMemo(() => MOBILE_PATTERN.test(mobile), [mobile]);
  const otpValid = useMemo(() => OTP_PATTERN.test(otp), [otp]);

  async function handleRequestOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (!mobileValid) {
      setError("شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد");
      return;
    }

    setSubmitting(true);
    try {
      await requestOtp({ mobile });
      setOtp("");
      setStep("otp");
      setInfo("کد تأیید برای شماره شما ارسال شد");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ارسال کد");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (!otpValid) {
      setError("کد تأیید را به‌درستی وارد کنید");
      return;
    }

    setSubmitting(true);
    try {
      const result = await verifyOtp({ mobile, code: otp });
      saveSession(result);
      router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در تأیید کد");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      await requestOtp({ mobile });
      setOtp("");
      setInfo("کد جدید ارسال شد");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ارسال مجدد کد");
    } finally {
      setSubmitting(false);
    }
  }

  function handleChangeMobile() {
    setStep("mobile");
    setOtp("");
    setError(null);
    setInfo(null);
  }

  return (
      <Stack
        component="form"
        spacing={2.5}
        onSubmit={step === "mobile" ? handleRequestOtp : handleVerifyOtp}
        noValidate
        sx={{ width: "100%" }}
      >
        <Stack alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "grid",
              placeItems: "center",
            }}
          >
            <PhoneIphoneOutlinedIcon />
          </Box>
          <Typography variant="h5" component="h1" fontWeight={600}>
            {step === "mobile" ? "ورود با موبایل" : "کد تأیید"}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {step === "mobile"
              ? "شماره موبایل خود را وارد کنید تا کد یکبارمصرف برایتان ارسال شود."
              : `کد ارسال‌شده به ${maskMobile(mobile)} را وارد کنید.`}
          </Typography>
        </Stack>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {info ? <Alert severity="success">{info}</Alert> : null}

        {step === "mobile" ? (
          <TextField
            label="شماره موبایل"
            name="mobile"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            fullWidth
            required
            value={mobile}
            onChange={(event) => setMobile(normalizeMobile(event.target.value))}
            disabled={submitting}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { maxLength: 11, dir: "ltr" },
            }}
          />
        ) : (
          <TextField
            label="کد تأیید"
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="------"
            fullWidth
            required
            autoFocus
            value={otp}
            onChange={(event) => setOtp(normalizeOtp(event.target.value))}
            disabled={submitting}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { maxLength: 8, dir: "ltr", style: { letterSpacing: "0.35em", textAlign: "center" } },
            }}
          />
        )}

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={
            submitting || (step === "mobile" ? !mobileValid : !otpValid)
          }
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {submitting
            ? step === "mobile"
              ? "در حال ارسال..."
              : "در حال تأیید..."
            : step === "mobile"
              ? "دریافت کد"
              : "ورود"}
        </Button>

        {step === "otp" ? (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={1}
          >
            <Link
              component="button"
              type="button"
              variant="body2"
              underline="hover"
              disabled={submitting}
              onClick={handleChangeMobile}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                border: 0,
                background: "none",
                cursor: submitting ? "default" : "pointer",
                color: "text.secondary",
              }}
            >
              <ArrowForwardIcon sx={{ fontSize: 16 }} />
              تغییر شماره
            </Link>
            <Link
              component="button"
              type="button"
              variant="body2"
              underline="hover"
              disabled={submitting}
              onClick={handleResend}
              sx={{
                border: 0,
                background: "none",
                cursor: submitting ? "default" : "pointer",
              }}
            >
              ارسال مجدد کد
            </Link>
          </Stack>
        ) : null}
      </Stack>
  );
}
