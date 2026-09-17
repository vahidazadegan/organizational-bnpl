---
name: organization-panel
description: >-
  Builds and changes the organizational BNPL Next.js UI under
  ui/organization-panel using Material 3 (MUI). Use when working on
  organization-panel, org panel, BNPL UI, Material 3/MUI screens, Next.js
  pages/components in this repo, or when the user asks to add screens, forms,
  tables, or API wiring for the organization panel.
---

# Organization Panel

## Scope

Work only under `ui/organization-panel` unless the task explicitly needs `service/organization-panel-service`.
UI must use **Material 3 via MUI** (`@mui/material`). Do not add competing UI kits.
Backend (when needed) lives in `service/organization-panel-service` on **Spring Boot 4.0.8** — use the `organization-panel-service` skill.

## Workflow

1. Confirm the feature (screen, API, auth, i18n) and target route.
2. Inspect existing `app/`, `components/`, theme, and API client patterns before adding new ones.
3. Prefer Server Components; mark client components only when interactivity or MUI client APIs require it.
4. Implement UI with MUI Material 3 components and theme tokens (`sx` / `styled`).
5. Wire types for API payloads; keep UI models close to API contracts.
6. Cover loading / empty / error states with MUI patterns (`Skeleton`, `Alert`, etc.).
7. Run lint/typecheck for touched files when scripts exist (`pnpm lint`, `pnpm tsc`, etc.).

## Feature checklist

```
- [ ] Route/page under app/
- [ ] Reusable UI in components/ (if shared) using MUI Material 3
- [ ] Theme tokens used (no ad-hoc CSS for core UI)
- [ ] Data access in lib/ or services/
- [ ] Types for request/response
- [ ] Loading / empty / error UI
- [ ] No secrets in client bundles
```

## Adding a screen

1. Create `app/<route>/page.tsx` (and `layout.tsx` only if the segment needs its own shell).
2. Extract presentational pieces into `components/<feature>/` built from MUI primitives.
3. Put fetch/mutation helpers in `lib/` or `services/`.
4. Keep page files thin: compose data + UI, avoid large inline markup.

## API wiring

- Reuse existing HTTP clients/hooks; do not introduce a second fetch stack.
- Handle non-2xx responses with user-visible errors.
- Document assumed endpoints in the PR/commit notes if the backend is not ready yet.

## Out of scope

- Do not scaffold a new Next app if `ui/organization-panel` already has one.
- Do not change `service/organization-panel-service` unless the user asks for backend work.
