# DTO library

Shared API DTOs for BNPL backends (`service/libs/dto`). Package folders mirror owning services:

| Package folder | Owning service |
|----------------|----------------|
| `.../admin/dto` | `admin-service` |
| `.../panel/dto` | `organization-panel-service` |
| `.../customer/dto` | `customer-service` |

Package names are unchanged so service code keeps the same imports.

Depends on `libs/domain` for shared enums used in response types.
