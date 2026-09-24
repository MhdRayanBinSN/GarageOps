# GarageOps API

Base URL during local development:

```text
http://localhost:5111
```

Swagger UI:

```text
http://localhost:5111/swagger
```

## Conventions

- JSON is used for request and response bodies.
- IDs are GUID values.
- Protected endpoints require a bearer token obtained from `POST /api/auth/login`.
- A workshop owner manages one workshop and its employees.
- Customers use a separate customer portal area (not yet implemented).
- Vehicle details are stored directly on `JobCard`; there is no separate Vehicle entity.

---

## Authentication

### Login

`POST /api/auth/login`

> **No auth required.**

Validates credentials and returns a JWT access token with user routing info.

**Request:**

```json
{
  "username": "cityadmin",
  "password": "ChangeMe123!"
}
```

**Response `200 OK`:**

```json
{
  "userId": "guid",
  "workshopId": "guid",
  "userType": "WorkshopOwner",
  "employeeRole": "Owner",
  "accessToken": "jwt-token",
  "expiresAt": "2026-09-22T12:00:00Z"
}
```

- `workshopId` is `null` for platform admins.
- `employeeRole` is `null` for non-employee users.
- Invalid credentials return `401 Unauthorized`.

Use the returned token for all protected endpoints:

```http
Authorization: Bearer {accessToken}
```

**`userType` values:**

```text
PlatformAdmin
WorkshopOwner
WorkshopEmployee
Customer
```

---

## Workshops

### Register Workshop

`POST /api/workshops/registration`

> **No auth required.**

Creates a workshop, its owner account, and the owner's workshop membership in one atomic operation.

**Request:**

```json
{
  "workshopName": "City Auto Garage",
  "workshopPhone": "0771234567",
  "workshopEmail": "cityauto@example.com",
  "workshopAddress": "Main Street",
  "ownerUsername": "cityadmin",
  "ownerEmail": "admin@cityauto.example.com",
  "ownerPassword": "ChangeMe123!"
}
```

**Response `201 Created`:**

```json
{
  "workshopId": "guid",
  "ownerUserId": "guid"
}
```

---

## Employees

> **Auth required.** Roles: `Owner`, `Manager`.
> The authenticated user's `workshopId` claim must match the `{workshopId}` path parameter.

### Endpoint Summary

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/workshops/{workshopId}/employees` | Create an employee |
| `GET` | `/api/workshops/{workshopId}/employees` | List workshop employees |
| `PUT` | `/api/workshops/{workshopId}/employees/{employeeId}/role` | Change an employee's role |
| `PATCH` | `/api/workshops/{workshopId}/employees/{employeeId}/activate` | Activate an employee |
| `PATCH` | `/api/workshops/{workshopId}/employees/{employeeId}/deactivate` | Deactivate an employee |

### Create Employee

`POST /api/workshops/{workshopId}/employees`

**Request:**

```json
{
  "username": "john_mechanic",
  "email": "john@cityauto.example.com",
  "password": "ChangeMe123!",
  "employeeRole": "Mechanic"
}
```

**Response `201 Created`:**

```json
{
  "id": "guid",
  "workshopId": "guid",
  "username": "john_mechanic",
  "email": "john@cityauto.example.com",
  "employeeRole": "Mechanic",
  "isActive": true
}
```

### List Employees

`GET /api/workshops/{workshopId}/employees`

**Response `200 OK`:** Array of `EmployeeResponse` (same shape as above).

### Change Employee Role

`PUT /api/workshops/{workshopId}/employees/{employeeId}/role`

**Request:**

```json
{
  "employeeRole": "Manager"
}
```

**Response `200 OK`:** Updated `EmployeeResponse`.
`404 Not Found` if the employee does not exist in this workshop.

### Activate / Deactivate Employee

`PATCH /api/workshops/{workshopId}/employees/{employeeId}/activate`
`PATCH /api/workshops/{workshopId}/employees/{employeeId}/deactivate`

No request body. Returns `204 No Content` on success, `404 Not Found` if not found.

### `employeeRole` values

```text
Owner
Manager
ServiceAdvisor
Mechanic
Technician
```

---

## Customers

> **Auth required.** Roles: `Owner`, `Manager`, `ServiceAdvisor`.
> The authenticated user's `workshopId` claim must match the `{workshopId}` path parameter.

### Endpoint Summary

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/workshops/{workshopId}/customers` | Create a customer |
| `GET` | `/api/workshops/{workshopId}/customers` | List workshop customers |
| `GET` | `/api/workshops/{workshopId}/customers/{customerId}` | Get a customer by ID |
| `PUT` | `/api/workshops/{workshopId}/customers/{customerId}` | Update a customer |
| `DELETE` | `/api/workshops/{workshopId}/customers/{customerId}` | Deactivate a customer |

### Create Customer

`POST /api/workshops/{workshopId}/customers`

**Request:**

```json
{
  "firstName": "Ahmed",
  "lastName": "Ali",
  "phone": "0771234567",
  "email": "ahmed@example.com",
  "address": "123 Main Street"
}
```

**Response `201 Created`:**

```json
{
  "id": "guid",
  "workshopId": "guid",
  "firstName": "Ahmed",
  "lastName": "Ali",
  "phone": "0771234567",
  "email": "ahmed@example.com",
  "address": "123 Main Street",
  "isActive": true
}
```

### List Customers

`GET /api/workshops/{workshopId}/customers`

**Response `200 OK`:** Array of `CustomerResponse`.

### Get Customer

`GET /api/workshops/{workshopId}/customers/{customerId}`

**Response `200 OK`:** `CustomerResponse`. `404 Not Found` if not found.

### Update Customer

`PUT /api/workshops/{workshopId}/customers/{customerId}`

**Request:** Same fields as `CreateCustomerRequest`.

**Response `200 OK`:** Updated `CustomerResponse`. `404 Not Found` if not found.

### Deactivate Customer

`DELETE /api/workshops/{workshopId}/customers/{customerId}`

No request body. Returns `204 No Content` on success, `404 Not Found` if not found.

---

## Job Cards

> **Auth required.** Roles: `Owner`, `Manager`, `ServiceAdvisor`.
> The authenticated user's `workshopId` claim must match the `{workshopId}` path parameter.

### Endpoint Summary

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/workshops/{workshopId}/job-cards` | Create a job card |
| `GET` | `/api/workshops/{workshopId}/job-cards` | List workshop job cards |
| `GET` | `/api/workshops/{workshopId}/job-cards/{jobCardId}` | Get a job card by ID |
| `PATCH` | `/api/workshops/{workshopId}/job-cards/{jobCardId}/status` | Update job card status |

### Create Job Card

`POST /api/workshops/{workshopId}/job-cards`

Vehicle details are captured directly on the job card.

**Request:**

```json
{
  "customerId": "guid",
  "title": "Full service and brake inspection",
  "description": "Customer reported squeaking brakes",
  "vehicleRegistrationNumber": "CAB-1234",
  "vehicleMake": "Toyota",
  "vehicleModel": "Corolla",
  "vehicleYear": 2020
}
```

**Response `201 Created`:**

```json
{
  "id": "guid",
  "workshopId": "guid",
  "customerId": "guid",
  "createdByUserId": "guid",
  "title": "Full service and brake inspection",
  "description": "Customer reported squeaking brakes",
  "vehicleRegistrationNumber": "CAB-1234",
  "vehicleMake": "Toyota",
  "vehicleModel": "Corolla",
  "vehicleYear": 2020,
  "status": "Draft",
  "createdAt": "2026-09-23T10:00:00Z",
  "updatedAt": null
}
```

### List Job Cards

`GET /api/workshops/{workshopId}/job-cards`

**Response `200 OK`:** Array of `JobCardResponse`.

### Get Job Card

`GET /api/workshops/{workshopId}/job-cards/{jobCardId}`

**Response `200 OK`:** `JobCardResponse`. `404 Not Found` if not found.

### Update Job Card Status

`PATCH /api/workshops/{workshopId}/job-cards/{jobCardId}/status`

**Request:**

```json
{
  "status": "InProgress"
}
```

**Response `200 OK`:** Updated `JobCardResponse`. `404 Not Found` if not found.

### `status` values

```text
Draft
Received
Diagnosing
AwaitingApproval
Approved
InProgress
QualityCheck
ReadyForDelivery
Completed
Cancelled
```

---

## Job Tasks

> **Auth required.** Roles: `Owner`, `Manager`, `ServiceAdvisor`, `Mechanic`, `Technician`.
> The token must carry a valid `workshop_id` claim.

### Endpoint Summary

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/job-cards/{jobCardId}/tasks` | Add a task to a job card |
| `GET` | `/api/job-cards/{jobCardId}/tasks` | List tasks for a job card |
| `POST` | `/api/job-cards/{jobCardId}/tasks/{taskId}/assign` | Assign a task to an employee |
| `PATCH` | `/api/job-cards/{jobCardId}/tasks/{taskId}/status` | Update task status |

### Create Task

`POST /api/job-cards/{jobCardId}/tasks`

**Request:**

```json
{
  "title": "Replace brake pads",
  "description": "Front and rear brake pads",
  "estimatedHours": 2.5
}
```

`estimatedHours` is optional.

**Response `201 Created`:**

```json
{
  "id": "guid",
  "jobCardId": "guid",
  "assignedToUserId": null,
  "title": "Replace brake pads",
  "description": "Front and rear brake pads",
  "status": "Pending",
  "estimatedHours": 2.5,
  "actualHours": null,
  "createdAt": "2026-09-23T10:00:00Z",
  "updatedAt": null
}
```

`404 Not Found` if the job card does not belong to the authenticated workshop.

### List Tasks

`GET /api/job-cards/{jobCardId}/tasks`

**Response `200 OK`:** Array of `JobTaskResponse`. `404 Not Found` if job card not found.

### Assign Task

`POST /api/job-cards/{jobCardId}/tasks/{taskId}/assign`

**Request:**

```json
{
  "userId": "guid"
}
```

**Response `200 OK`:** Updated `JobTaskResponse`. `404 Not Found` if task not found.

### Update Task Status

`PATCH /api/job-cards/{jobCardId}/tasks/{taskId}/status`

**Request:**

```json
{
  "status": "InProgress"
}
```

**Response `200 OK`:** Updated `JobTaskResponse`. `404 Not Found` if task not found.

### Task `status` values

```text
Pending
Assigned
InProgress
Completed
Cancelled
```

---

## Services Catalog

> **Auth required.** Roles: `Owner`, `Manager`, `ServiceAdvisor`.
> The authenticated user's `workshopId` claim must match the `{workshopId}` path parameter.

### Endpoint Summary

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/workshops/{workshopId}/services` | Create a service |
| `GET` | `/api/workshops/{workshopId}/services` | List services |
| `PUT` | `/api/workshops/{workshopId}/services/{serviceId}` | Update a service |
| `DELETE` | `/api/workshops/{workshopId}/services/{serviceId}` | Deactivate a service |

### Create Service

`POST /api/workshops/{workshopId}/services`

**Request:**

```json
{
  "name": "Full Service",
  "description": "Complete vehicle service including oil change",
  "defaultPrice": 150.00
}
```

**Response `201 Created`:**

```json
{
  "id": "guid",
  "workshopId": "guid",
  "name": "Full Service",
  "description": "Complete vehicle service including oil change",
  "defaultPrice": 150.00,
  "isActive": true
}
```

### List Services

`GET /api/workshops/{workshopId}/services`

**Response `200 OK`:** Array of `ServiceResponse`.

### Update Service

`PUT /api/workshops/{workshopId}/services/{serviceId}`

**Request:** Same fields as `CreateServiceRequest`.

**Response `200 OK`:** Updated `ServiceResponse`. `404 Not Found` if not found.

### Deactivate Service

`DELETE /api/workshops/{workshopId}/services/{serviceId}`

No request body. Returns `204 No Content` on success, `404 Not Found` if not found.

---

## Parts & Inventory

> **Auth required.** Roles: `Owner`, `Manager`, `ServiceAdvisor`.
> The authenticated user's `workshopId` claim must match the `{workshopId}` path parameter.

### Endpoint Summary

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/workshops/{workshopId}/parts` | Add a part |
| `GET` | `/api/workshops/{workshopId}/parts` | List parts |
| `PUT` | `/api/workshops/{workshopId}/parts/{partId}` | Update a part |
| `PATCH` | `/api/workshops/{workshopId}/parts/{partId}/stock` | Adjust stock quantity |
| `DELETE` | `/api/workshops/{workshopId}/parts/{partId}` | Deactivate a part |

### Add Part

`POST /api/workshops/{workshopId}/parts`

**Request:**

```json
{
  "name": "Brake Pad Set",
  "partNumber": "BP-4321",
  "unitPrice": 45.00,
  "stockQuantity": 20
}
```

**Response `201 Created`:**

```json
{
  "id": "guid",
  "workshopId": "guid",
  "name": "Brake Pad Set",
  "partNumber": "BP-4321",
  "unitPrice": 45.00,
  "stockQuantity": 20,
  "isActive": true
}
```

### List Parts

`GET /api/workshops/{workshopId}/parts`

**Response `200 OK`:** Array of `PartResponse`.

### Update Part

`PUT /api/workshops/{workshopId}/parts/{partId}`

**Request:**

```json
{
  "name": "Brake Pad Set (Premium)",
  "unitPrice": 55.00
}
```

**Response `200 OK`:** Updated `PartResponse`. `404 Not Found` if not found.

### Adjust Stock

`PATCH /api/workshops/{workshopId}/parts/{partId}/stock`

Use a positive `quantityChange` to add stock, negative to deduct.

**Request:**

```json
{
  "quantityChange": -5
}
```

**Response `200 OK`:** Updated `PartResponse`.
`400 Bad Request` if the adjustment would make stock go negative.
`404 Not Found` if the part does not exist.

### Deactivate Part

`DELETE /api/workshops/{workshopId}/parts/{partId}`

No request body. Returns `204 No Content` on success, `404 Not Found` if not found.

---

## Invoices & Payments

> **Auth required.** Roles: `Owner`, `Manager`, `ServiceAdvisor`.
> The token must carry a valid `workshop_id` claim matching the resource's workshop.

### Endpoint Summary

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/job-cards/{jobCardId}/invoice` | Create an invoice for a job card |
| `GET` | `/api/invoices/{invoiceId}` | Get an invoice |
| `POST` | `/api/invoices/{invoiceId}/finalize` | Finalize an invoice |
| `POST` | `/api/invoices/{invoiceId}/payments` | Record a payment |
| `GET` | `/api/invoices/{invoiceId}/payments` | List invoice payments |

### Create Invoice

`POST /api/job-cards/{jobCardId}/invoice`

The `jobCardId` in the body must match the path parameter.

**Request:**

```json
{
  "jobCardId": "guid",
  "customerId": "guid",
  "invoiceNumber": "INV-0001",
  "subtotal": 200.00,
  "tax": 20.00
}
```

**Response `201 Created`:**

```json
{
  "id": "guid",
  "workshopId": "guid",
  "jobCardId": "guid",
  "customerId": "guid",
  "invoiceNumber": "INV-0001",
  "subtotal": 200.00,
  "tax": 20.00,
  "total": 220.00,
  "status": "Draft"
}
```

`400 Bad Request` if the `jobCardId` in the body does not match the path.

### Get Invoice

`GET /api/invoices/{invoiceId}`

**Response `200 OK`:** `InvoiceResponse`. `404 Not Found` if not found.

### Finalize Invoice

`POST /api/invoices/{invoiceId}/finalize`

No request body. Transitions the invoice from `Draft` to `Finalized`.

**Response `200 OK`:** Updated `InvoiceResponse`.
`400 Bad Request` if the invoice is not in a finalizable state.
`404 Not Found` if not found.

### Record Payment

`POST /api/invoices/{invoiceId}/payments`

**Request:**

```json
{
  "amount": 220.00,
  "method": "Cash"
}
```

**Response `200 OK`:**

```json
{
  "id": "guid",
  "invoiceId": "guid",
  "amount": 220.00,
  "method": "Cash",
  "paidAt": "2026-09-23T10:00:00Z"
}
```

`400 Bad Request` if the invoice is not finalized or the payment is otherwise invalid.
`404 Not Found` if not found.

### List Payments

`GET /api/invoices/{invoiceId}/payments`

**Response `200 OK`:** Array of `PaymentResponse`. `404 Not Found` if the invoice does not exist.

### `InvoiceStatus` values

```text
Draft
Finalized
Paid
Cancelled
```

### `PaymentMethod` values

```text
Cash
Card
BankTransfer
```

---

## Not Yet Implemented

The following modules are planned but not yet built:

| Module | Notes |
|---|---|
| Customer Portal | `GET /api/customer-portal/profile`, job card viewing and progress tracking for customers |
| Auth — Refresh & Logout | `POST /api/auth/refresh-token`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Workshop Management | `GET`, `PUT`, `PATCH /activate`, `PATCH /deactivate` on `/api/workshops/{workshopId}` |
| Job Status History | Timeline / audit trail of job card status changes |
| Invoice Line Items | Attaching services and parts to invoice lines |
| Notifications | Dashboard summaries and real-time notifications |
