# GarageOps backend architecture

Keep the backend organized by application/domain responsibility. Roles and user types belong in authorization policies and claims; avoid separate `Admin/`, `FrontDesk/`, `Mechanic/`, or `Customer/` controller/service trees, which would duplicate the same business workflows.

## Current layered solution

```text
Backend/
├── GarageOps.API/
│   ├── Controllers/                 # HTTP endpoints and request/response handling
│   ├── Authorization/               # API claim-policy registration
│   ├── Middleware/                  # Cross-cutting HTTP pipeline behavior
│   ├── Extensions/                  # API/DI registration helpers
│   └── Program.cs
├── GarageOps.Application/
│   ├── Abstractions/Persistence/    # Repository and unit-of-work contracts
│   ├── Authentication/              # Login/registration and auth DTOs
│   ├── Authorization/               # Capability names and role-to-capability matrix
│   ├── Workshops/                    # Workshop use cases and DTOs
│   ├── Employees/                    # Employee use cases and DTOs
│   ├── Customers/                    # Customer use cases and DTOs
│   ├── Jobs/                         # Job card use cases and DTOs
│   ├── Tasks/                        # Assignment, progress, and work logs
│   ├── Catalog/                      # Service and part catalog use cases
│   ├── Parts/                        # Stock requests and job part usage
│   └── Billing/                      # Invoices and payments
├── GarageOps.Domain/
│   ├── Entities/                     # Workshop, user, customer, job, task, part, invoice
│   ├── Enums/                        # UserType, EmployeeRole, workflow states
│   ├── ValueObjects/
│   └── Exceptions/
└── GarageOps.Infrastructure/
    ├── Persistence/                  # DbContext, entity configuration, migrations
    ├── Repositories/                 # Repository implementations
    ├── Authentication/               # JWT creation and password hashing
    └── UnitOfWork.cs
```

The names above describe responsibilities, not a requirement to create an empty file for every suggested type. Follow the existing `GarageOps.*` project names and split files when a feature has enough behavior to justify it.

## Authorization placement

- Define capabilities and the role matrix centrally in `GarageOps.Application/Authorization/PermissionCatalog.cs`; register claim policies in `GarageOps.API/Authorization/PermissionPolicyExtensions.cs`.
- Put endpoint authorization on controllers/actions with those policies.
- Put record ownership and workshop scoping in the application service/repository query as well; a role check alone does not prevent cross-workshop or cross-customer access.
- Keep frontend route/menu checks as a usability layer. The API remains the security boundary.
- Keep role-to-capability mapping in one backend matrix and mirror it in the frontend permission utility.

## Workflow ownership

```text
Workshop registration -> Workshop + initial Admin account (no EmployeeRole)
Admin                 -> workshop setup, employees, services, parts, stock, all records
Front Desk            -> customers, job cards, task creation/assignment, job progress,
                         operational part confirmation, invoice and payment workflow
Mechanic              -> assigned jobs/tasks, status, work notes, hours, part request/use
Customer              -> own profile, vehicles derived from jobs, job progress, invoices, payments
```

Keep customer portal authorization separate from employee roles. Portal accounts use the unique nullable `Customer.PortalUserId`; staff provisions access, and each portal query scopes through the linked user. Do not authorize a customer with a workshop employee role or expose workshop-wide list endpoints to customer accounts.

## Domain model notes

- `JobCard` currently carries vehicle fields directly. Introduce a separate `Vehicle` entity only with a migration and a deliberate relationship/backfill plan; do not create an unused repository/interface set first.
- Part requests and part usage belong to job workflow/inventory behavior, not to a role-specific module.
- Billing stays a domain module. Role access can be corrected independently from a billing redesign.
- Preserve stored enum values when simplifying role names. Treat legacy values explicitly and avoid silently reinterpreting existing accounts with broader permissions.
