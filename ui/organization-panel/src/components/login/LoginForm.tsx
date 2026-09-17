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
import { useState } from "react";
import { loginRequest, saveSession } from "@/lib/auth/session";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await loginRequest({ username, password });
      saveSession(result);
      router.push("/welcome");
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
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit} noValidate>
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
          disabled={submitting}
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
          disabled={submitting}
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
