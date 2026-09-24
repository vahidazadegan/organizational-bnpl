# Domain library

Shared JPA entities for BNPL backends (`service/libs/domain`). Package folders mirror owning services:

| Package folder | Owning service |
|----------------|----------------|
| `.../admin/domain` | `admin-service` |
| `.../panel/domain` | `organization-panel-service` |

Package names are unchanged (`com.organizational.bnpl.admin.domain`, `com.organizational.bnpl.panel.domain`) so service code keeps the same imports.

Add new entities under the package that matches the owning service. Liquibase changelogs stay in each service module.
