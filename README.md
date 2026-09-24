# organizational-bnpl

Organizational BNPL monorepo: Next.js panel UIs + Spring Boot backends.

## Structure

```
ui/organization-panel/                 # Next.js + Material 3 (MUI) — org panel
ui/customer-app/                       # Next.js + Material 3 (MUI) — customer
ui/admin-panel/                        # Next.js + Material 3 (MUI) — admin
service/                               # Maven multi-module (Spring Boot 4.0.8)
  libs/domain/                         # Shared JPA entities (admin/, panel/ packages)
  libs/dto/                            # Shared API DTOs (admin/, panel/, customer/, merchant/)
  organization-panel-service/          # Panel backend (port 8080)
  customer-service/                    # Customer backend (port 8081)
  admin-service/                       # Admin backend (port 8082)
  merchant-service/                    # Merchant purchase API (port 8083)
```

## Backend

Dev DB is shared (`bnpl_db`). Migrate order matters for merchants:

1. Start `admin-service` first (creates `merchants`)
2. Then `organization-panel-service` (FK `purchases.merchant_id` + `reserved_credit`)
3. Then `merchant-service` (no Liquibase; validates schema)

```bash
cd service
./mvnw -pl admin-service spring-boot:run
./mvnw -pl organization-panel-service spring-boot:run
./mvnw -pl customer-service spring-boot:run
./mvnw -pl merchant-service spring-boot:run
```

Merchant purchase flow: `POST /api/auth/token` → `POST /api/purchases/initiate` → `POST /api/purchases/{id}/confirm`.

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

# Admin (port 3002 → API 8082)
cd ui/admin-panel
pnpm install
cp .env.example .env.local
pnpm dev
```

Panel UI: http://localhost:3000 · Panel API: http://localhost:8080  
Customer UI: http://localhost:3001 · Customer API: http://localhost:8081  
Admin UI: http://localhost:3002 · Admin API: http://localhost:8082  
Merchant API: http://localhost:8083
