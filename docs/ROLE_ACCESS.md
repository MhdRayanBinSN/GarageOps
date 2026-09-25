# GarageOps role and capability model

## Role structure

- **Admin** is the workshop account created with workshop registration. It controls workshop setup, employees, customers, job cards, services, parts/stock, billing, and reporting.
- **Front Desk** is an employee role for daily customer and job operations: customer records, job cards, task creation and assignment, job progress, part request processing, and operational billing.
- **Mechanic** is an employee role for assigned tasks, work notes, actual hours, progress updates, stock availability, and part requests for their assigned work.
- **Customer** is a separate user type, not an employee role. Front Desk/Admin can provision portal access for a customer. The customer portal exposes only data linked to that login: profile, vehicles derived from service records, job progress, invoices, and payments.

Admin is a `WorkshopAdmin` user type, not an employee role. Registration creates the Admin with no `EmployeeRole`. New employees can only be created or changed to Front Desk or Mechanic. There is no Billing Staff role. Inventory Staff is no longer offered to new accounts; the legacy enum value remains so existing stored accounts continue to work with inventory-only capabilities. The old Manager value maps to Front Desk permissions, and Technician maps to Mechanic permissions. The migration clears the old Owner employee marker from Admin accounts while preserving the employee-role integer values for remaining accounts.

## Where access is defined

- Stored user types and employee roles: `Backend/GarageOps.Domain/Enums/UserType.cs` and `Backend/GarageOps.Domain/Enums/EmployeeRole.cs`. Enum integer values remain stable for existing database rows.
- Backend role-to-capability matrix and canonical claim names: `Backend/GarageOps.Application/Authorization/PermissionCatalog.cs`.
- JWT capability claims: `Backend/GarageOps.Infrastructure/Authentication/JwtTokenService.cs`.
- API claim policies: `Backend/GarageOps.API/Authorization/PermissionPolicyExtensions.cs`; controllers declare policies and apply workshop scoping.
- Frontend navigation, route access, and home routing: `Frontend/src/utils/permissions.ts`, `Frontend/src/router.tsx`, and `Frontend/src/components/layout/Sidebar.tsx`. These improve navigation but do not replace API authorization.
- Customer accounts are linked by the unique nullable `Customers.PortalUserId`; the migration is `AddCustomerPortalAccess`. Portal read queries scope by the authenticated linked user ID.

## Main capability split

| Capability | Admin | Front Desk | Mechanic | Customer |
| --- | --- | --- | --- | --- |
| Workshop settings, employees and roles | Manage | — | — | — |
| Customers and all workshop jobs | Manage | Manage | Assigned work only | Own records only |
| Tasks | Create and assign | Create and assign | Update assigned tasks | View own job progress |
| Service catalog and inventory master | Manage | View service catalog | — | View through own job/invoice data |
| Parts workflow | Manage and process | Confirm/process requests | Request for assigned tasks | View through own job/invoice data |
| Billing | Manage invoices and payments | Operational billing | — | View own invoices and payments |

Workshop-scoped controller checks remain in place alongside capability policies. Customer portal repository queries filter through `Customer.PortalUserId`, so a customer cannot use a workshop-wide list endpoint to read another customer's data.
