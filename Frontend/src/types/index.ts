// All TypeScript interfaces mirroring the GarageOps REST API DTOs

// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserType = 'PlatformAdmin' | 'WorkshopAdmin' | 'WorkshopEmployee' | 'Customer'

// Manager/Technician/InventoryStaff/Owner are accepted only for existing stored accounts.
export type EmployeeRole = 'Owner' | 'Manager' | 'FrontDesk' | 'Mechanic' | 'Technician' | 'InventoryStaff'
export type AccessRole = 'Admin' | 'FrontDesk' | 'Mechanic' | 'Customer' | 'InventoryStaff'

export interface CustomerPortalProfile {
  customerId: string
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
  workshopName: string
}

export interface CustomerPortalTask {
  id: string
  title: string
  status: TaskStatus
  estimatedHours: number | null
  actualHours: number | null
  workPerformed: string | null
}

export interface CustomerPortalJob {
  id: string
  title: string
  description: string
  status: JobStatus
  createdAt: string
  vehicleRegistrationNumber: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  tasks: CustomerPortalTask[]
  parts: { name: string; quantity: number }[]
}

export interface CustomerPortalInvoice {
  id: string
  jobCardId: string
  invoiceNumber: string
  subtotal: number
  tax: number
  total: number
  status: InvoiceStatus
  createdAt: string
  payments: { amount: number; method: PaymentMethod; paidAt: string }[]
}

export interface CustomerPortalVehicle {
  registrationNumber: string
  make: string
  model: string
  year: number
  lastServicedAt: string
}

export interface CustomerPortalPayment {
  id: string
  invoiceId: string
  invoiceNumber: string
  amount: number
  method: PaymentMethod
  paidAt: string
}

export type PartRequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Issued'

export interface CreatePartRequestRequest {
  jobTaskId: string
  partId: string
  quantity: number
  notes?: string
}

export interface PartRequestResponse {
  id: string
  workshopId: string
  jobCardId: string
  jobTaskId: string
  partId: string
  partName: string
  partNumber: string
  quantity: number
  status: PartRequestStatus
  requestedByUserId: string
  requestedByName: string
  processedByUserId: string | null
  processedByName: string | null
  notes: string
  jobTitle: string
  vehicleRegistrationNumber: string
  taskTitle: string
  createdAt: string
  processedAt: string | null
}

export type JobStatus =
  | 'Draft'
  | 'Received'
  | 'Diagnosing'
  | 'AwaitingApproval'
  | 'Approved'
  | 'InProgress'
  | 'QualityCheck'
  | 'ReadyForDelivery'
  | 'Completed'
  | 'Cancelled'

export type TaskStatus = 'Pending' | 'Assigned' | 'InProgress' | 'Completed' | 'Cancelled'

export type InvoiceStatus = 'Draft' | 'Finalized' | 'Paid' | 'Cancelled'

export type PaymentMethod = 'Cash' | 'Card' | 'BankTransfer'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  userId: string
  workshopId: string | null
  userType: UserType
  employeeRole: EmployeeRole | null
  accessToken: string
  expiresAt: string
}

// ─── Workshop Registration ────────────────────────────────────────────────────

export interface WorkshopRegistrationRequest {
  workshopName: string
  workshopPhone: string
  workshopEmail: string
  workshopAddress: string
  adminUsername: string
  adminEmail: string
  adminPassword: string
}

export interface WorkshopRegistrationResponse {
  workshopId: string
  adminUserId: string
}

// ─── Employees ────────────────────────────────────────────────────────────────

export interface CreateEmployeeRequest {
  username: string
  email: string
  password: string
  employeeRole: EmployeeRole
}

export interface UpdateEmployeeRoleRequest {
  employeeRole: EmployeeRole
}

export interface EmployeeResponse {
  id: string
  workshopId: string
  username: string
  email: string
  employeeRole: EmployeeRole
  isActive: boolean
}

// ─── Customers ────────────────────────────────────────────────────────────────

export interface CreateCustomerRequest {
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
}

export interface UpdateCustomerRequest {
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
}

export interface CustomerResponse {
  id: string
  workshopId: string
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
  isActive: boolean
  hasPortalAccess: boolean
}

// ─── Job Cards ────────────────────────────────────────────────────────────────

export interface CreateJobCardRequest {
  customerId: string
  title: string
  description: string
  vehicleRegistrationNumber: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
}

export interface UpdateJobStatusRequest {
  status: JobStatus
}

export interface JobCardResponse {
  id: string
  workshopId: string
  customerId: string
  createdByUserId: string
  title: string
  description: string
  vehicleRegistrationNumber: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  status: JobStatus
  createdAt: string
  updatedAt: string | null
}

// ─── Job Tasks ────────────────────────────────────────────────────────────────

export interface CreateJobTaskRequest {
  title: string
  description: string
  estimatedHours?: number
}

export interface AssignJobTaskRequest {
  userId: string
}

export interface UpdateJobTaskStatusRequest {
  status: TaskStatus
  actualHours?: number
  workPerformed?: string
}

export interface JobTaskResponse {
  id: string
  jobCardId: string
  assignedToUserId: string | null
  title: string
  description: string
  status: TaskStatus
  estimatedHours: number | null
  actualHours: number | null
  createdAt: string
  updatedAt: string | null
  jobTitle?: string | null
  vehicleRegistrationNumber?: string | null
  vehicleMake?: string | null
  vehicleModel?: string | null
  vehicleYear?: number | null
  workPerformed?: string | null
}

// ─── Services ─────────────────────────────────────────────────────────────────

export interface CreateServiceRequest {
  name: string
  description: string
  defaultPrice: number
}

export interface UpdateServiceRequest {
  name: string
  description: string
  defaultPrice: number
}

export interface ServiceResponse {
  id: string
  workshopId: string
  name: string
  description: string
  defaultPrice: number
  isActive: boolean
}

// ─── Parts ────────────────────────────────────────────────────────────────────

export interface CreatePartRequest {
  name: string
  partNumber: string
  unitPrice: number
  stockQuantity: number
}

export interface UpdatePartRequest {
  name: string
  unitPrice: number
}

export interface AdjustStockRequest {
  quantityChange: number
}

export interface PartResponse {
  id: string
  workshopId: string
  name: string
  partNumber: string
  unitPrice: number
  stockQuantity: number
  isActive: boolean
}

export interface InventoryAvailabilityResponse {
  id: string
  name: string
  partNumber: string
  stockQuantity: number
  isActive: boolean
}

// ─── Invoices & Payments ──────────────────────────────────────────────────────

export interface CreateInvoiceRequest {
  jobCardId: string
  customerId: string
  invoiceNumber: string
  subtotal: number
  tax: number
}

export interface InvoiceResponse {
  id: string
  workshopId: string
  jobCardId: string
  customerId: string
  invoiceNumber: string
  subtotal: number
  tax: number
  total: number
  status: InvoiceStatus
}

export interface CreatePaymentRequest {
  amount: number
  method: PaymentMethod
}

export interface PaymentResponse {
  id: string
  invoiceId: string
  amount: number
  method: PaymentMethod
  paidAt: string
}

// ─── API Error ────────────────────────────────────────────────────────────────

export interface ApiError {
  message: string
  statusCode: number
}
