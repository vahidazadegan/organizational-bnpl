"use client";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type AnimationEvent } from "react";
import { loginRequest, saveSession } from "@/lib/auth/session";

export function LoginForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const syncAutofilledValues = useCallback(() => {
    const form = formRef.current;
    if (!form) {
      return;
    }

    const usernameInput = form.elements.namedItem("username");
    const passwordInput = form.elements.namedItem("password");

    if (usernameInput instanceof HTMLInputElement && usernameInput.value) {
      setUsername(usernameInput.value);
    }
    if (passwordInput instanceof HTMLInputElement && passwordInput.value) {
      setPassword(passwordInput.value);
    }
  }, []);

  useEffect(() => {
    // Chrome/Firefox may fill credentials after the first paint.
    const timers = [0, 100, 500].map((ms) =>
      window.setTimeout(syncAutofilledValues, ms),
    );
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [syncAutofilledValues]);

  function handleAutofillAnimation(event: AnimationEvent<HTMLDivElement>) {
    if (event.animationName === "mui-auto-fill") {
      syncAutofilledValues();
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await loginRequest({ username, password });
      saveSession(result);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ورود");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 420,
        p: { xs: 3, sm: 4 },
        borderRadius: "20px",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 18px 50px rgba(26, 11, 46, 0.12)",
      }}
    >
      <Stack
        component="form"
        ref={formRef}
        spacing={2.5}
        onSubmit={handleSubmit}
        noValidate
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
            <LockOutlinedIcon />
          </Box>
          <Typography variant="h5" component="h1" fontWeight={600}>
            ورود به پنل
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            با نام کاربری و رمز عبور پنل وارد شوید.
          </Typography>
        </Stack>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <TextField
          label="نام کاربری"
          name="username"
          autoComplete="username"
          fullWidth
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          onAnimationStart={handleAutofillAnimation}
          disabled={submitting}
          slotProps={{
            inputLabel: { shrink: true },
          }}
        />
        <TextField
          label="رمز عبور"
          name="password"
          type="password"
          autoComplete="current-password"
          fullWidth
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onAnimationStart={handleAutofillAnimation}
          disabled={submitting}
          slotProps={{
            inputLabel: { shrink: true },
          }}
        />
        <FormControlLabel
          control={<Checkbox name="remember" color="primary" disabled={submitting} />}
          label="مرا به خاطر بسپار"
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={submitting || !username || !password}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {submitting ? "در حال ورود..." : "ورود"}
        </Button>
      </Stack>
    </Paper>
  );
}
