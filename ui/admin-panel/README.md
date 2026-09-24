# Admin Panel (Next.js + Material 3)

## Prerequisites

- Node.js 18+
- pnpm 10+

## Setup

```bash
cd ui/admin-panel
pnpm install
cp .env.example .env.local
pnpm dev
```

App runs at [http://localhost:3002](http://localhost:3002).

Backend API default: `http://localhost:8082` (`NEXT_PUBLIC_API_BASE_URL`).

Dev login (seeded by admin-service): `admin` / `admin123`.
