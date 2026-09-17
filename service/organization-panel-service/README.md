# organization-panel-service

Spring Boot **4.0.8** backend for Organizational BNPL panel.

## Prerequisites

- Java 21+
- Maven Wrapper (`./mvnw`) included
- PostgreSQL **18.6** (see `docker-compose-dev/`)

## Database

Default connection (matches `docker-compose-dev`):

| Setting | Value |
|---------|-------|
| URL | `jdbc:postgresql://localhost:5432/bnpl_db` |
| User | `bnpl` |
| Password | `bnpl@nilva` |

Override with env vars: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.

Schema is managed by **Liquibase** (`src/main/resources/db/changelog/`). Hibernate `ddl-auto` is `validate`.

```bash
cd docker-compose-dev
docker compose up -d
```

## Security (OAuth2 Resource Server)

API endpoints (except health) require a Bearer JWT issued by your OAuth2/OIDC provider.

| Setting | Env / default |
|---------|----------------|
| Issuer URI | `OAUTH2_ISSUER_URI` (default `http://localhost:8081/realms/bnpl`) |

Clients (e.g. `ui/organization-panel`) must obtain a token from the IdP and send:

```http
Authorization: Bearer <access_token>
```

Public (no auth):

- `GET /api/health`
- `GET /actuator/health`
- `GET /actuator/info`

Authenticated sample:

- `GET /api/me` — returns JWT subject and claims

## Run

```bash
cd service/organization-panel-service
export OAUTH2_ISSUER_URI=http://localhost:8081/realms/bnpl
./mvnw spring-boot:run
```

- API: [http://localhost:8080/api/health](http://localhost:8080/api/health)
- Actuator: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

## Test

Tests use in-memory H2 (`application-test.yml`) and a stub `JwtDecoder`.

```bash
./mvnw test
```

## Package layout

```
com.organizational.bnpl.panel
  controller/
  service/
  repository/
  domain/
  dto/
  config/          # SecurityConfig (OAuth2 JWT), WebConfig
  exception/
```
