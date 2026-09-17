---
name: nextjs-feature
description: >-
  Implements a vertical Next.js + Material 3 (MUI) feature (route, components,
  data layer, types) in organizational-bnpl. Use when the user asks to add a
  feature, page, form, table, or end-to-end UI flow in the organization panel.
---

# Next.js Feature Workflow

## Steps

1. **Clarify**: route path, actors/roles, data source, success/error behavior.
2. **Scaffold**:
   - `app/.../page.tsx` for the route
   - `components/<feature>/` for MUI Material 3 UI pieces
   - `lib/<feature>/` or `services/<feature>/` for data access
   - `types/<feature>.ts` if types are non-trivial
3. **Implement** server-first; push `"use client"` to leaf interactive MUI components.
4. **Style** with theme tokens (`sx` / `styled`); reuse existing MD3 theme.
5. **Validate** empty/loading/error paths with MUI (`Skeleton`, `Alert`).
6. **Verify** with available project scripts (lint, typecheck, unit tests).

## File sketch

```
ui/organization-panel/
  app/(panel)/organizations/page.tsx
  components/organizations/OrganizationTable.tsx
  lib/organizations/api.ts
  types/organization.ts
  theme/                # Material 3 theme (if present)
```

## Done when

- Feature is reachable from the intended route
- UI uses Material 3 / MUI (no competing UI library)
- Types compile
- Main happy path and failure path are handled in UI
