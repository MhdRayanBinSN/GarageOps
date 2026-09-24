// All TypeScript interfaces mirroring the GarageOps REST API DTOs

// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserType = 'PlatformAdmin' | 'WorkshopOwner' | 'WorkshopEmployee' | 'Customer'

export type EmployeeRole = 'Owner' | 'Manager' | 'ServiceAdvisor' | 'Mechanic' | 'Technician'

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
  ownerUsername: string
  ownerEmail: string
  ownerPassword: string
}

export interface WorkshopRegistrationResponse {
  workshopId: string
  ownerUserId: string
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
