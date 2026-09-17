import {
  Alert,
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

async function fetchServiceHealth(): Promise<{
  ok: boolean;
  status?: string;
  service?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/health`, {
      next: { revalidate: 0 },
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}` };
    }

    const data = (await response.json()) as {
      status: string;
      service: string;
    };
    return { ok: true, status: data.status, service: data.service };
  } catch {
    return {
      ok: false,
      error: "Backend unreachable. Start organization-panel-service on :8080.",
    };
  }
}

export default async function HomePage() {
  const health = await fetchServiceHealth();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Organization Panel
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Next.js + Material 3 scaffold for Organizational BNPL.
          </Typography>
        </Box>

        {health.ok ? (
          <Alert severity="success">
            Backend {health.service} is {health.status}
          </Alert>
        ) : (
          <Alert severity="warning">{health.error}</Alert>
        )}

        <Stack direction="row" spacing={2}>
          <Button variant="contained" href="/login">
            Login page
          </Button>
          <Button
            variant="outlined"
            href={`${API_BASE}/actuator/health`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Actuator health
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
