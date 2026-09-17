"use client";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

/**
 * Display-only login form. Submit does nothing.
 */
export function LoginForm() {
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
        spacing={2.5}
        onSubmit={(event) => {
          event.preventDefault();
        }}
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
            این صفحه فقط برای نمایش است و عملی انجام نمی‌دهد.
          </Typography>
        </Stack>

        <TextField
          label="نام کاربری"
          name="username"
          autoComplete="username"
          fullWidth
          required
        />
        <TextField
          label="رمز عبور"
          name="password"
          type="password"
          autoComplete="current-password"
          fullWidth
          required
        />
        <FormControlLabel
          control={<Checkbox name="remember" color="primary" />}
          label="مرا به خاطر بسپار"
        />
        <Button type="submit" variant="contained" size="large" fullWidth>
          ورود
        </Button>
      </Stack>
    </Paper>
  );
}
