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

## Security (panel login + JWT)

Panel users authenticate against `panel_users` with username/password. Successful login returns a Bearer JWT that must be sent on subsequent API calls.

### Login

```http
POST /api/auth/login
Content-Type: application/json

{"username":"panel.admin","password":"..."}
```

Response includes `accessToken`, `tokenType` (`Bearer`), `expiresIn`, and `user`.

Passwords in DB are **BCrypt** hashes (`password_hash`). Only users with `status=ACTIVE` can log in.

### JWT config

| Setting | Env / default |
|---------|----------------|
| Secret (HS256, ≥32 bytes) | `JWT_SECRET` |
| Issuer | `JWT_ISSUER` (default `organization-panel-service`) |
| Expiration (seconds) | `JWT_EXPIRATION_SECONDS` (default `3600`) |

Clients send:

```http
Authorization: Bearer <access_token>
```

Public (no auth):

- `POST /api/auth/login`
- `GET /api/health`
- `GET /actuator/health`
- `GET /actuator/info`

Authenticated sample:

- `GET /api/me` — returns JWT subject and claims

## Run

```bash
cd service/organization-panel-service
export JWT_SECRET='replace-with-a-long-random-secret-key'
./mvnw spring-boot:run
```

- API: [http://localhost:8080/api/health](http://localhost:8080/api/health)
- Actuator: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)
- Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- OpenAPI JSON: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

## Swagger / OpenAPI

springdoc-openapi serves Swagger UI. Use **Authorize** with a Bearer token from `POST /api/auth/login`.

## Test

Tests use in-memory H2 (`application-test.yml`) and a local JWT secret.

```bash
./mvnw test
```

## Package layout

```
com.organizational.bnpl.panel
  controller/      # AuthController, HealthController, MeController
  service/         # AuthService, JwtTokenService, ...
  security/        # PanelUserDetailsService, PanelUserPrincipal
  repository/
  domain/
  dto/
  config/          # SecurityConfig, JwtConfig, OpenApiConfig, WebConfig
  exception/
```
