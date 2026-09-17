---
name: organization-panel-service
description: >-
  Builds and changes the organizational BNPL Spring Boot 4.0.8 backend under
  service/organization-panel-service. Use when working on organization-panel-service,
  backend APIs, Spring Boot, Java services, controllers, repositories, DTOs,
  security, or persistence for the organization panel.
---

# Organization Panel Service

## Scope

Work under `service/organization-panel-service`.
Backend must use **Spring Boot 4.0.8**. Do not upgrade/downgrade the Boot version unless the user asks.

## Stack

- Spring Boot **4.0.8**
- Java (follow the module’s configured language version)
- **Lombok** for boilerplate (getters/setters/ctors/loggers) — see `.cursor/rules/java-lombok.mdc`
- Persistence: **PostgreSQL** via Spring Data JPA (`spring-boot-starter-data-jpa` + `postgresql` driver)
- Table naming: **plural** physical names (e.g. `organizations`) — see `.cursor/rules/db-table-naming.mdc`
- Schema migrations: **Liquibase** (`spring-boot-starter-liquibase`, changelogs under `src/main/resources/db/changelog/`)
- Security: **Spring Security** with panel login (`POST /api/auth/login` against `panel_users`) issuing HS256 JWT; resource server validates Bearer tokens. Configure `JWT_SECRET`. Keep `/api/auth/login`, `/api/health`, actuator health/info, and Swagger (`/swagger-ui/**`, `/v3/api-docs/**`) public; protect other APIs.
- API docs: **springdoc-openapi** Swagger UI at `/swagger-ui.html`
- Config defaults align with `docker-compose-dev` (`bnpl_db` / `bnpl`)
- Typical pieces: Spring Web, Validation, Spring Data JPA, Liquibase, Spring Security JWT login, **springdoc-openapi** (Swagger UI)

## Lombok

- Always use Lombok instead of hand-written boilerplate on new/changed Java types.
- JPA entities: `@Getter` `@Setter` `@NoArgsConstructor`; avoid `@Data` on entities.
- Prefer `record` for immutable DTOs when that fits; otherwise Lombok.

## Workflow

1. Confirm the API/use case (resource, method, auth, persistence).
2. Inspect existing packages (`controller`, `service`, `repository`, `domain`, `dto`, `config`) before adding new ones.
3. Add or update DTOs + validation, then service logic, then controller mapping.
4. Keep transactions and domain rules in the service layer.
5. Add/adjust tests next to the changed behavior when the module already has a test setup.
6. Run module build/tests when scripts exist (`./mvnw test`, `./gradlew test`, etc.).

## Feature checklist

```
- [ ] API contract (path, method, status codes) agreed or documented
- [ ] Request/response DTOs + validation
- [ ] Service-layer business logic
- [ ] Persistence / integration only where needed
- [ ] Error handling consistent with existing advice/handlers
- [ ] No secrets in source or committed config
- [ ] Spring Boot version remains 4.0.8
```

## Adding an endpoint

1. Define request/response DTOs.
2. Implement service method (and repository/entity changes if required).
3. Expose via `@RestController` with clear mapping and status codes.
4. Reuse existing exception handling; add a typed exception only if needed.
5. Update OpenAPI/docs only if the project already maintains them.

## Package sketch

```
service/organization-panel-service/
  src/main/java/.../
    controller/
    service/
    repository/
    domain/   (or entity/)
    dto/
    config/
  src/main/resources/
    application.yml
  pom.xml   # or build.gradle — Spring Boot 4.0.8
```

## Out of scope

- Do not change `ui/organization-panel` unless the user asks for frontend work.
- Do not introduce a non-Spring HTTP framework.
