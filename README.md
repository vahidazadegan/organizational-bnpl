# organizational-bnpl

Organizational BNPL monorepo: Next.js panel UI + Spring Boot backend.

## Structure

```
ui/organization-panel/                 # Next.js + Material 3 (MUI) — panel
ui/customer-app/                       # Next.js + Material 3 (MUI) — customer
service/                               # Maven multi-module (Spring Boot 4.0.8)
  organization-panel-service/          # Panel backend module
  customer-service/                    # Customer backend module
```

## Backend

```bash
cd service
./mvnw -pl organization-panel-service spring-boot:run
./mvnw -pl customer-service spring-boot:run
```

## Frontend

```bash
# Panel (port 3000 → API 8080)
cd ui/organization-panel
pnpm install
cp .env.example .env.local
pnpm dev

# Customer (port 3001 → API 8081)
cd ui/customer-app
pnpm install
cp .env.example .env.local
pnpm dev
```

Panel UI: http://localhost:3000 · Panel API: http://localhost:8080  
Customer UI: http://localhost:3001 · Customer API: http://localhost:8081
