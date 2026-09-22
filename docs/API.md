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
- Protected endpoints will require a bearer token after JWT authentication is added.
- A workshop owner manages one workshop and its employees.
- Customers use a separate customer portal area.
- Vehicle details are stored on `JobCard`; there is no separate Vehicle API in the first version.

## Implemented Endpoints

### Workshop Registration

`POST /api/workshops/registration`

Creates a workshop, its owner account, and the owner's workshop membership in one operation.

Request:

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

Response: `201 Created`

```json
{
  "workshopId": "guid",
  "ownerUserId": "guid"
}
```

### Login

`POST /api/auth/login`

Validates a username and password and returns the user's account routing information.

Request:

```json
{
  "username": "cityadmin",
  "password": "ChangeMe123!"
}
```

Response: `200 OK`

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

Invalid credentials return `401 Unauthorized`.

Use the returned token for protected endpoints:

```http
Authorization: Bearer {accessToken}
```

## Planned API Modules

### Authentication

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/auth/login` | Sign in a user |
| `POST` | `/api/auth/refresh-token` | Refresh an access token |
| `POST` | `/api/auth/logout` | End a session |
| `GET` | `/api/auth/me` | Return the current authenticated user |

### Workshop Management

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/workshops/registration` | Register a workshop and owner |
| `GET` | `/api/workshops/{workshopId}` | View workshop details |
| `PUT` | `/api/workshops/{workshopId}` | Update workshop details |
| `PATCH` | `/api/workshops/{workshopId}/activate` | Activate a workshop |
| `PATCH` | `/api/workshops/{workshopId}/deactivate` | Deactivate a workshop |

### Employee Management

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/workshops/{workshopId}/employees` | Create an employee account |
| `GET` | `/api/workshops/{workshopId}/employees` | List workshop employees |
| `GET` | `/api/employees/{employeeId}` | View an employee |
| `PUT` | `/api/employees/{employeeId}` | Update an employee |
| `PUT` | `/api/employees/{employeeId}/role` | Change an employee role |
| `PATCH` | `/api/employees/{employeeId}/activate` | Activate an employee |
| `PATCH` | `/api/employees/{employeeId}/deactivate` | Deactivate an employee |
| `DELETE` | `/api/employees/{employeeId}` | Remove an employee |

Supported employee roles:

```text
Owner
Manager
ServiceAdvisor
Mechanic
Technician
```

### Customer Management

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/workshops/{workshopId}/customers` | Create a customer |
| `GET` | `/api/workshops/{workshopId}/customers` | List workshop customers |
| `GET` | `/api/customers/{customerId}` | View a customer |
| `PUT` | `/api/customers/{customerId}` | Update a customer |
| `DELETE` | `/api/customers/{customerId}` | Remove a customer |

### Customer Portal

Customers must only access their own records.

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/customer-portal/profile` | View the current customer profile |
| `GET` | `/api/customer-portal/job-cards` | View the customer's job cards |
| `GET` | `/api/customer-portal/job-cards/{jobCardId}` | View one customer job card |
| `GET` | `/api/customer-portal/job-cards/{jobCardId}/tracking` | View job progress |

### Job Cards

Vehicle information is captured directly on each job card.

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/workshops/{workshopId}/job-cards` | Create a job card |
| `GET` | `/api/workshops/{workshopId}/job-cards` | List workshop job cards |
| `GET` | `/api/job-cards/{jobCardId}` | View a job card |
| `PUT` | `/api/job-cards/{jobCardId}` | Update a job card |
| `DELETE` | `/api/job-cards/{jobCardId}` | Cancel or remove a job card |
| `PATCH` | `/api/job-cards/{jobCardId}/status` | Change job status |
| `GET` | `/api/job-cards/{jobCardId}/tracking` | View status history and progress |

Job card vehicle fields:

```text
vehicleRegistrationNumber
vehicleMake
vehicleModel
vehicleYear
```

Supported job statuses:

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

### Job Tasks

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/job-cards/{jobCardId}/tasks` | Add a task |
| `GET` | `/api/job-cards/{jobCardId}/tasks` | List job tasks |
| `PUT` | `/api/tasks/{taskId}` | Update a task |
| `POST` | `/api/tasks/{taskId}/assign` | Assign a task to an employee |
| `PATCH` | `/api/tasks/{taskId}/status` | Change task status |
| `DELETE` | `/api/tasks/{taskId}` | Remove a task |

Supported task statuses:

```text
Pending
Assigned
InProgress
Completed
Cancelled
```

### Services Catalog

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/workshops/{workshopId}/services` | Create a service |
| `GET` | `/api/workshops/{workshopId}/services` | List services |
| `GET` | `/api/services/{serviceId}` | View a service |
| `PUT` | `/api/services/{serviceId}` | Update a service |
| `DELETE` | `/api/services/{serviceId}` | Deactivate a service |

### Parts and Inventory

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/workshops/{workshopId}/parts` | Add a part |
| `GET` | `/api/workshops/{workshopId}/parts` | List parts |
| `GET` | `/api/parts/{partId}` | View a part |
| `PUT` | `/api/parts/{partId}` | Update a part |
| `PATCH` | `/api/parts/{partId}/stock` | Adjust stock quantity |
| `DELETE` | `/api/parts/{partId}` | Deactivate a part |

### Invoices and Payments

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/job-cards/{jobCardId}/invoice` | Create an invoice |
| `GET` | `/api/invoices/{invoiceId}` | View an invoice |
| `PUT` | `/api/invoices/{invoiceId}` | Update an invoice |
| `POST` | `/api/invoices/{invoiceId}/finalize` | Finalize an invoice |
| `POST` | `/api/invoices/{invoiceId}/payments` | Record a payment |
| `GET` | `/api/invoices/{invoiceId}/payments` | List invoice payments |

## Build Order

1. JWT authentication and authorization
2. Employee management
3. Customer management
4. Job card creation
5. Task assignment and status updates
6. Customer tracking portal
7. Services and inventory
8. Invoices and payments
9. Notifications and dashboard summaries
