# organizational-bnpl

Organizational BNPL monorepo: Next.js panel UI + Spring Boot backend.

## Structure

```
ui/organization-panel/                 # Next.js + Material 3 (MUI)
service/organization-panel-service/    # Spring Boot 4.0.8
```

## Backend

```bash
cd service/organization-panel-service
./mvnw spring-boot:run
```

## Frontend

```bash
cd ui/organization-panel
pnpm install
cp .env.example .env.local
pnpm dev
```

UI: http://localhost:3000  
API: http://localhost:8080
